import Student from '../models/Student.js';
import { generateQRCode, verifyQRCode } from '../services/qrService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

// @desc    Get student's QR code
// @route   GET /api/v1/qr/my-qr
// @access  Private (Student)
export const getMyQRCode = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return errorResponse(res, 'Student profile not found', 404);
    }

    if (!student.paymentVerified) {
      return errorResponse(res, 'Payment must be verified before generating QR code', 400);
    }

    if (student.qrCodeUsed) {
      return errorResponse(res, 'QR code already used. Cannot regenerate.', 400);
    }

    const qrResult = await generateQRCode(student._id);

    successResponse(res, {
      qrCode: qrResult.qrCode,
      qrUsed: student.qrCodeUsed,
      generatedAt: student.updatedAt,
    }, 'QR code retrieved successfully');

  } catch (error) {
    logger.error('Get QR error:', error);
    errorResponse(res, error.message || 'Failed to retrieve QR code');
  }
};

// @desc    Verify QR code (for examiners)
// @route   POST /api/v1/qr/verify
// @access  Private (Examiner)
export const verifyQR = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return errorResponse(res, 'QR data is required', 400);
    }

    const result = await verifyQRCode(qrData);

    if (!result.valid) {
      return errorResponse(res, result.error, 400, { code: result.code, usedAt: result.usedAt });
    }

    successResponse(res, {
      student: result.student,
      message: 'QR code is valid and student is eligible for exam',
    });

  } catch (error) {
    logger.error('QR verification error:', error);
    errorResponse(res, 'QR verification failed');
  }
};
