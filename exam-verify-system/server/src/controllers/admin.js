import Student from '../models/Student.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Verification from '../models/Verification.js';

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res, next) => {
    try {
        const totalStudents = await Student.countDocuments();
        const registeredCount = await Student.countDocuments({ registrationComplete: true });
        const paidCount = await Student.countDocuments({ paymentVerified: true });
        const verifiedCount = await Student.countDocuments({ qrCodeUsed: true });

        // Total payments (simulated sum)
        const totalPayments = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Recent activity (last 10 verifications)
        const recentActivity = await Verification.find()
            .populate('studentId')
            .populate('examinerId', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                registeredCount,
                paidCount,
                verifiedCount,
                totalRevenue: totalPayments.length > 0 ? totalPayments[0].total : 0,
                recentActivity
            }
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get all students
// @route   GET /api/v1/admin/students
// @access  Private (Admin)
export const getStudents = async (req, res, next) => {
    try {
        const students = await Student.find().populate('userId', 'name email avatar');
        res.status(200).json({
            success: true,
            data: students
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Manually update student status
// @route   PUT /api/v1/admin/students/:id/status
// @access  Private (Admin)
export const updateStudentStatus = async (req, res, next) => {
    try {
        const { paymentVerified, qrCodeUsed } = req.body;

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { paymentVerified, qrCodeUsed },
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
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

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};
