import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Student from '../models/Student.js';
import logger from '../utils/logger.js';

const generateQRToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateQRCode = async (studentId) => {
  try {
    const student = await Student.findById(studentId).populate('userId');

    if (!student) {
      throw new Error('Student not found');
    }

    if (!student.paymentVerified) {
      throw new Error('Payment not verified');
    }

    if (student.qrCodeGenerated && !student.qrCodeUsed) {
      const existingQR = await generateQRString(student);
      return { success: true, qrCode: existingQR };
    }

    const qrToken = generateQRToken();

    const payload = {
      studentId: student._id,
      matricNumber: student.matricNumber,
      name: student.userId.name,
      email: student.userId.email,
      department: student.department,
      faculty: student.faculty,
      level: student.level,
      photoUrl: student.photoUrl,
      qrToken,
      generatedAt: new Date(),
    };

    const signedToken = jwt.sign(payload, process.env.QR_ENCRYPTION_KEY, {
      expiresIn: '30d',
    });

    const qrCodeDataUrl = await QRCode.toDataURL(signedToken, {
      errorCorrectionLevel: 'H',
      width: 400,
      margin: 2,
    });

    student.qrCodeToken = qrToken;
    student.qrCodeGenerated = true;
    await student.save();

    logger.info(`QR code generated for student ${student.matricNumber}`);

    return {
      success: true,
      qrCode: qrCodeDataUrl,
      token: signedToken,
    };

  } catch (error) {
    logger.error('QR generation error:', error);
    throw error;
  }
};

const generateQRString = async (student) => {
  const payload = {
    studentId: student._id,
    matricNumber: student.matricNumber,
    name: student.userId.name,
    email: student.userId.email,
    department: student.department,
    faculty: student.faculty,
    level: student.level,
    photoUrl: student.photoUrl,
    qrToken: student.qrCodeToken,
    generatedAt: student.updatedAt,
  };

  const signedToken = jwt.sign(payload, process.env.QR_ENCRYPTION_KEY, {
    expiresIn: '30d',
  });

  const qrCodeDataUrl = await QRCode.toDataURL(signedToken, {
    errorCorrectionLevel: 'H',
    width: 400,
    margin: 2,
  });

  return qrCodeDataUrl;
};

export const verifyQRCode = async (qrData) => {
  try {
    const decoded = jwt.verify(qrData, process.env.QR_ENCRYPTION_KEY);

    const student = await Student.findById(decoded.studentId).populate('userId');

    if (!student) {
      return {
        valid: false,
        error: 'Student not found',
        code: 'STUDENT_NOT_FOUND',
      };
    }

    if (student.qrCodeToken !== decoded.qrToken) {
      return {
        valid: false,
        error: 'Invalid or forged QR code',
        code: 'TOKEN_MISMATCH',
      };
    }

    if (student.qrCodeUsed) {
      return {
        valid: false,
        error: 'QR code already used',
        code: 'ALREADY_USED',
        usedAt: student.qrCodeUsedAt,
        student: {
          name: student.userId.name,
          matricNumber: student.matricNumber,
        },
      };
    }

    if (!student.paymentVerified) {
      return {
        valid: false,
        error: 'Payment not verified',
        code: 'PAYMENT_NOT_VERIFIED',
      };
    }

    return {
      valid: true,
      student: {
        id: student._id,
        name: student.userId.name,
        email: student.userId.email,
        matricNumber: student.matricNumber,
        department: student.department,
        faculty: student.faculty,
        level: student.level,
        photoUrl: student.photoUrl,
        examDetails: student.examDetails,
      },
    };

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        error: 'QR code expired',
        code: 'EXPIRED',
      };
    }

    if (error.name === 'JsonWebTokenError') {
      return {
        valid: false,
        error: 'Invalid QR code format',
        code: 'INVALID_FORMAT',
      };
    }

    logger.error('QR verification error:', error);
    return {
      valid: false,
      error: 'QR code verification failed',
      code: 'VERIFICATION_ERROR',
    };
  }
};
