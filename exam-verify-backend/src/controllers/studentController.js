import Student from '../models/Student.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/uploadService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';
import { z } from 'zod';

const registrationSchema = z.object({
  matricNumber: z.string().min(5).max(20).toUpperCase(),
  department: z.string().min(3),
  faculty: z.string().min(3),
  level: z.enum(['100', '200', '300', '400', '500']),
});

// @desc    Register student (complete profile)
// @route   POST /api/v1/student/register
// @access  Private
export const registerStudent = async (req, res) => {
  try {
    const existingStudent = await Student.findOne({ userId: req.user._id });

    if (existingStudent) {
      return errorResponse(res, 'Student already registered', 400);
    }

    const validation = registrationSchema.safeParse(req.body);

    if (!validation.success) {
      return errorResponse(res, 'Validation failed', 400, validation.error.errors);
    }

    const { matricNumber, department, faculty, level } = validation.data;

    const matricExists = await Student.findOne({ matricNumber });

    if (matricExists) {
      return errorResponse(res, 'Matric number already registered', 400);
    }

    if (!req.file) {
      return errorResponse(res, 'Profile photo is required', 400);
    }

    const uploadResult = await uploadToCloudinary(req.file.path);

    const student = await Student.create({
      userId: req.user._id,
      matricNumber,
      department,
      faculty,
      level,
      photoUrl: uploadResult.url,
      photoPublicId: uploadResult.publicId,
      registrationComplete: true,
    });

    logger.info(`Student registered: ${matricNumber}`);

    successResponse(res, {
      student: {
        id: student._id,
        matricNumber: student.matricNumber,
        department: student.department,
        faculty: student.faculty,
        level: student.level,
        photoUrl: student.photoUrl,
        registrationComplete: student.registrationComplete,
      }
    }, 'Registration completed successfully', 201);

  } catch (error) {
    logger.error('Student registration error:', error);
    errorResponse(res, error.message || 'Registration failed');
  }
};

// @desc    Get student profile
// @route   GET /api/v1/student/profile
// @access  Private (Student)
export const getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('userId', 'name email avatar');

    if (!student) {
      return errorResponse(res, 'Student profile not found', 404);
    }

    successResponse(res, { student });

  } catch (error) {
    logger.error('Get profile error:', error);
    errorResponse(res, 'Failed to fetch profile');
  }
};

// @desc    Update student profile
// @route   PUT /api/v1/student/profile
// @access  Private (Student)
export const updateProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return errorResponse(res, 'Student profile not found', 404);
    }

    const { department, faculty, level } = req.body;

    if (department) student.department = department;
    if (faculty) student.faculty = faculty;
    if (level) student.level = level;

    if (req.file) {
      if (student.photoPublicId) {
        await deleteFromCloudinary(student.photoPublicId);
      }

      const uploadResult = await uploadToCloudinary(req.file.path);
      student.photoUrl = uploadResult.url;
      student.photoPublicId = uploadResult.publicId;
    }

    await student.save();

    logger.info(`Profile updated for student ${student.matricNumber}`);

    successResponse(res, { student }, 'Profile updated successfully');

  } catch (error) {
    logger.error('Update profile error:', error);
    errorResponse(res, 'Failed to update profile');
  }
};

// @desc    Get student dashboard data
// @route   GET /api/v1/student/dashboard
// @access  Private (Student)
export const getDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('userId', 'name email avatar');

    if (!student) {
      return errorResponse(res, 'Student profile not found', 404);
    }

    const Payment = (await import('../models/Payment.js')).default;
    const payment = await Payment.findOne({ studentId: student._id })
      .sort({ createdAt: -1 });

    successResponse(res, {
      student,
      payment,
      status: {
        registrationComplete: student.registrationComplete,
        paymentVerified: student.paymentVerified,
        qrGenerated: student.qrCodeGenerated,
        qrUsed: student.qrCodeUsed,
      },
    });

  } catch (error) {
    logger.error('Get dashboard error:', error);
    errorResponse(res, 'Failed to fetch dashboard data');
  }
};
