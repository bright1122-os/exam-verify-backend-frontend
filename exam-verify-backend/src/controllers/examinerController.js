import Verification from '../models/Verification.js';
import Student from '../models/Student.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';
import { getIO } from '../config/socket.js';
import { decrypt } from '../utils/crypto.js';

// @desc    Scan and decode QR code
// @route   POST /api/v1/examiner/scan
// @access  Private (Examiner)
export const scanQR = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return errorResponse(res, 'QR data is required', 400);
    }

    let decryptedData;
    try {
      const decrypted = decrypt(qrData);
      decryptedData = JSON.parse(decrypted);
    } catch {
      return errorResponse(res, 'Invalid or corrupted QR code', 400);
    }

    const student = await Student.findOne({
      qrCodeToken: decryptedData.token || qrData,
    }).populate('userId', 'name email avatar');

    if (!student) {
      return errorResponse(res, 'Student not found for this QR code', 404);
    }

    if (student.qrCodeUsed) {
      return errorResponse(res, 'This QR code has already been used', 400);
    }

    if (!student.paymentVerified) {
      return errorResponse(res, 'Payment not verified for this student', 400);
    }

    successResponse(res, {
      student: {
        id: student._id,
        name: student.userId?.name,
        email: student.userId?.email,
        avatar: student.userId?.avatar,
        matricNumber: student.matricNumber,
        department: student.department,
        faculty: student.faculty,
        level: student.level,
        photoUrl: student.photoUrl,
        qrCodeUsed: student.qrCodeUsed,
      },
    }, 'QR code scanned successfully');

  } catch (error) {
    logger.error('Scan QR error:', error);
    errorResponse(res, 'Failed to scan QR code');
  }
};

// @desc    Approve student entry
// @route   POST /api/v1/examiner/approve
// @access  Private (Examiner)
export const approveEntry = async (req, res) => {
  try {
    const { studentId, examHall, notes } = req.body;

    if (!studentId || !examHall) {
      return errorResponse(res, 'Student ID and exam hall are required', 400);
    }

    const student = await Student.findById(studentId).populate('userId');

    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }

    if (student.qrCodeUsed) {
      return errorResponse(res, 'QR code already used', 400);
    }

    student.qrCodeUsed = true;
    student.qrCodeUsedAt = new Date();
    await student.save();

    const verification = await Verification.create({
      studentId: student._id,
      examinerId: req.user._id,
      qrCodeToken: student.qrCodeToken,
      status: 'approved',
      examHall,
      notes,
    });

    logger.info(`Entry approved for student ${student.matricNumber} by examiner ${req.user.email}`);

    try {
      const io = getIO();
      io.emit('verification:approved', {
        student: {
          name: student.userId?.name,
          matricNumber: student.matricNumber,
        },
        examHall,
        timestamp: new Date(),
      });
    } catch {
      // Socket not initialized, skip
    }

    successResponse(res, {
      verification,
      message: 'Student entry approved successfully',
    }, 'Entry approved', 201);

  } catch (error) {
    logger.error('Approve entry error:', error);
    errorResponse(res, 'Failed to approve entry');
  }
};

// @desc    Deny student entry
// @route   POST /api/v1/examiner/deny
// @access  Private (Examiner)
export const denyEntry = async (req, res) => {
  try {
    const { studentId, examHall, notes, denialReason } = req.body;

    if (!studentId || !denialReason) {
      return errorResponse(res, 'Student ID and denial reason are required', 400);
    }

    const student = await Student.findById(studentId).populate('userId');

    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }

    const verification = await Verification.create({
      studentId: student._id,
      examinerId: req.user._id,
      qrCodeToken: student.qrCodeToken,
      status: 'denied',
      examHall: examHall || 'Not specified',
      notes,
      denialReason,
    });

    logger.info(`Entry denied for student ${student.matricNumber}: ${denialReason}`);

    try {
      const io = getIO();
      io.emit('verification:denied', {
        student: {
          name: student.userId?.name,
          matricNumber: student.matricNumber,
        },
        reason: denialReason,
        timestamp: new Date(),
      });
    } catch {
      // Socket not initialized, skip
    }

    successResponse(res, {
      verification,
      message: 'Student entry denied',
    }, 'Entry denied', 201);

  } catch (error) {
    logger.error('Deny entry error:', error);
    errorResponse(res, 'Failed to deny entry');
  }
};

// @desc    Get verification history
// @route   GET /api/v1/examiner/history
// @access  Private (Examiner)
export const getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = { examinerId: req.user._id };
    if (status) query.status = status;

    const verifications = await Verification.find(query)
      .populate({
        path: 'studentId',
        select: 'matricNumber department level',
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
    logger.error('Get history error:', error);
    errorResponse(res, 'Failed to fetch verification history');
  }
};

// @desc    Get examiner statistics
// @route   GET /api/v1/examiner/stats
// @access  Private (Examiner)
export const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await Verification.aggregate([
      {
        $match: {
          examinerId: req.user._id,
          verifiedAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const allTimeStats = await Verification.aggregate([
      {
        $match: { examinerId: req.user._id },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const formatStats = (stats) => {
      const approved = stats.find(s => s._id === 'approved')?.count || 0;
      const denied = stats.find(s => s._id === 'denied')?.count || 0;
      return { approved, denied, total: approved + denied };
    };

    successResponse(res, {
      today: formatStats(todayStats),
      allTime: formatStats(allTimeStats),
    });

  } catch (error) {
    logger.error('Get stats error:', error);
    errorResponse(res, 'Failed to fetch statistics');
  }
};
