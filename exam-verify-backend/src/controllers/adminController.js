import User from '../models/User.js';
import Student from '../models/Student.js';
import Payment from '../models/Payment.js';
import Verification from '../models/Verification.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const registeredStudents = await Student.countDocuments({ registrationComplete: true });
    const paidStudents = await Student.countDocuments({ paymentVerified: true });
    const qrGenerated = await Student.countDocuments({ qrCodeGenerated: true });
    const qrUsed = await Student.countDocuments({ qrCodeUsed: true });

    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });

    const totalVerifications = await Verification.countDocuments();
    const approvedVerifications = await Verification.countDocuments({ status: 'approved' });
    const deniedVerifications = await Verification.countDocuments({ status: 'denied' });

    // Get payment amount stats
    const paymentStats = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
        },
      },
    ]);

    // Recent activity
    const recentVerifications = await Verification.find()
      .populate('studentId', 'matricNumber')
      .populate('examinerId', 'name email')
      .sort({ verifiedAt: -1 })
      .limit(10);

    successResponse(res, {
      students: {
        total: totalStudents,
        registered: registeredStudents,
        paid: paidStudents,
        qrGenerated,
        qrUsed,
      },
      payments: {
        total: totalPayments,
        completed: completedPayments,
        pending: pendingPayments,
        totalAmount: paymentStats[0]?.totalAmount || 0,
        avgAmount: paymentStats[0]?.avgAmount || 0,
      },
      verifications: {
        total: totalVerifications,
        approved: approvedVerifications,
        denied: deniedVerifications,
      },
      recentActivity: recentVerifications,
    });

  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    errorResponse(res, 'Failed to fetch dashboard statistics');
  }
};

// @desc    Get all students
// @route   GET /api/v1/admin/students
// @access  Private (Admin)
export const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    let query = {};

    // Search by name or matric number
    if (search) {
      const students = await Student.find()
        .populate('userId', 'name email');

      const filtered = students.filter(s =>
        s.userId.name.toLowerCase().includes(search.toLowerCase()) ||
        s.matricNumber.toLowerCase().includes(search.toLowerCase())
      );

      return successResponse(res, {
        students: filtered.slice((page - 1) * limit, page * limit),
        pagination: {
          total: filtered.length,
          page: parseInt(page),
          pages: Math.ceil(filtered.length / limit),
        },
      });
    }

    // Filter by status
    if (status === 'registered') {
      query.registrationComplete = true;
    } else if (status === 'paid') {
      query.paymentVerified = true;
    } else if (status === 'qr-generated') {
      query.qrCodeGenerated = true;
    } else if (status === 'qr-used') {
      query.qrCodeUsed = true;
    }

    const students = await Student.find(query)
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    successResponse(res, {
      students,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    logger.error('Get all students error:', error);
    errorResponse(res, 'Failed to fetch students');
  }
};

// @desc    Get student details
// @route   GET /api/v1/admin/students/:id
// @access  Private (Admin)
export const getStudentDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email avatar lastLogin');

    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }

    // Get payment history
    const payments = await Payment.find({ studentId: student._id })
      .sort({ createdAt: -1 });

    // Get verification history
    const verifications = await Verification.find({ studentId: student._id })
      .populate('examinerId', 'name email')
      .sort({ verifiedAt: -1 });

    successResponse(res, {
      student,
      payments,
      verifications,
    });

  } catch (error) {
    logger.error('Get student details error:', error);
    errorResponse(res, 'Failed to fetch student details');
  }
};

// @desc    Update student status (manual override)
// @route   PUT /api/v1/admin/students/:id/status
// @access  Private (Admin)
export const updateStudentStatus = async (req, res) => {
  try {
    const { paymentVerified, qrCodeUsed } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }

    if (typeof paymentVerified === 'boolean') {
      student.paymentVerified = paymentVerified;
    }

    if (typeof qrCodeUsed === 'boolean') {
      student.qrCodeUsed = qrCodeUsed;
      if (qrCodeUsed) {
        student.qrCodeUsedAt = new Date();
      } else {
        student.qrCodeUsedAt = null;
      }
    }

    await student.save();

    logger.info(`Admin ${req.user.email} updated status for student ${student.matricNumber}`);

    successResponse(res, { student }, 'Student status updated successfully');

  } catch (error) {
    logger.error('Update student status error:', error);
    errorResponse(res, 'Failed to update student status');
  }
};

// @desc    Get all payments
// @route   GET /api/v1/admin/payments
// @access  Private (Admin)
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = status ? { status } : {};

    const payments = await Payment.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    successResponse(res, {
      payments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    logger.error('Get all payments error:', error);
    errorResponse(res, 'Failed to fetch payments');
  }
};

// @desc    Get all verifications
// @route   GET /api/v1/admin/verifications
// @access  Private (Admin)
export const getAllVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, examHall } = req.query;

    let query = {};
    if (status) query.status = status;
    if (examHall) query.examHall = examHall;

    const verifications = await Verification.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .populate('examinerId', 'name email')
      .sort({ verifiedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Verification.countDocuments(query);

    successResponse(res, {
      verifications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    logger.error('Get all verifications error:', error);
    errorResponse(res, 'Failed to fetch verifications');
  }
};

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const query = role ? { role } : {};

    const users = await User.find(query)
      .select('-__v')
      .sort({ createdAt: -1 });

    successResponse(res, { users });

  } catch (error) {
    logger.error('Get all users error:', error);
    errorResponse(res, 'Failed to fetch users');
  }
};

// @desc    Update user role
// @route   PUT /api/v1/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['student', 'examiner', 'admin'].includes(role)) {
      return errorResponse(res, 'Invalid role', 400);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.role = role;
    await user.save();

    logger.info(`Admin ${req.user.email} updated role for user ${user.email} to ${role}`);

    successResponse(res, { user }, 'User role updated successfully');

  } catch (error) {
    logger.error('Update user role error:', error);
    errorResponse(res, 'Failed to update user role');
  }
};
