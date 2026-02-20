import Student from '../models/Student.js';
import Payment from '../models/Payment.js';

// Upload photo — uses Cloudinary if configured, else returns a placeholder
async function uploadPhoto(fileBuffer, mimetype, userId) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    // Cloudinary upload via REST API (no SDK needed)
    const { createReadStream } = await import('stream');
    const cloudinary = (await import('cloudinary')).v2;

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'exam-verify/photos', public_id: `student-${userId}-${Date.now()}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });

    return result.secure_url;
  }

  // Fallback placeholder if Cloudinary not configured
  return `https://ui-avatars.com/api/?name=Student&background=1E40AF&color=fff&size=200`;
}

// @desc    Complete student profile
// @route   POST /api/v1/student/register
// @access  Private (Student)
export const registerStudent = async (req, res, next) => {
  try {
    const { matricNumber, department, faculty, level } = req.body;

    // Check if already fully registered
    const existing = await Student.findOne({ userId: req.user.id });
    if (existing && existing.registrationComplete) {
      return res.status(400).json({
        success: false,
        error: 'Student profile already completed',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a passport photograph',
      });
    }

    // Upload photo
    const photoUrl = await uploadPhoto(req.file.buffer, req.file.mimetype, req.user.id);

    let student;
    if (existing) {
      student = await Student.findOneAndUpdate(
        { userId: req.user.id },
        { matricNumber, department, faculty, level, photoUrl, registrationComplete: true },
        { new: true, runValidators: true }
      );
    } else {
      student = await Student.create({
        userId: req.user.id,
        matricNumber,
        department,
        faculty,
        level,
        photoUrl,
        registrationComplete: true,
      });
    }

    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get student profile
// @route   GET /api/v1/student/profile
// @access  Private (Student)
export const getStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate('userId', 'name email avatar');

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }

    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get student dashboard data
// @route   GET /api/v1/student/dashboard
// @access  Private (Student)
export const getStudentDashboard = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });

    // Fetch latest payment if student exists
    let payment = null;
    if (student) {
      payment = await Payment.findOne({ studentId: student._id }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      data: {
        student,
        payment,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
