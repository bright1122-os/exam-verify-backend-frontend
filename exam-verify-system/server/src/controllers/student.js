import Student from '../models/Student.js';
import User from '../models/User.js';

// @desc    Complete student profile
// @route   POST /api/v1/student/register
// @access  Private (Student)
export const registerStudent = async (req, res, next) => {
    try {
        const { matricNumber, department, faculty, level } = req.body;

        // Check if student already registered
        let student = await Student.findOne({ userId: req.user.id });
        if (student && student.registrationComplete) {
            return res.status(400).json({
                success: false,
                error: 'Student profile already completed'
            });
        }

        // Check if photo uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a passport photograph'
            });
        }

        // Photo URL (local path for now, will integrate Cloudinary later)
        const photoUrl = `/uploads/temp/${req.file.filename}`;

        if (student) {
            // Update existing record
            student = await Student.findOneAndUpdate(
                { userId: req.user.id },
                {
                    matricNumber,
                    department,
                    faculty,
                    level,
                    photoUrl,
                    registrationComplete: true
                },
                { new: true, runValidators: true }
            );
        } else {
            // Create new student record
            student = await Student.create({
                userId: req.user.id,
                matricNumber,
                department,
                faculty,
                level,
                photoUrl,
                registrationComplete: true
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get current student profile
// @route   GET /api/v1/student/profile
// @access  Private (Student)
export const getStudentProfile = async (req, res, next) => {
    try {
        const student = await Student.findOne({ userId: req.user.id }).populate('userId', 'name email avatar');

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get student dashboard data
// @route   GET /api/v1/student/dashboard
// @access  Private (Student)
export const getStudentDashboard = async (req, res, next) => {
    try {
        const student = await Student.findOne({ userId: req.user.id });

        // Mock dashboard stats for now
        res.status(200).json({
            success: true,
            data: {
                student,
                stats: {
                    registrations: 1,
                    payments: student?.paymentVerified ? 1 : 0,
                    qrGenerated: student?.qrCodeGenerated ? 1 : 0
                }
            }
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};
