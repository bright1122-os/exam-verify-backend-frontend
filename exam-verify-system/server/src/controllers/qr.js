import Student from '../models/Student.js';
import Verification from '../models/Verification.js';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// @desc    Generate student QR code
// @route   GET /api/v1/qr/my-qr
// @access  Private (Student)
export const generateMyQR = async (req, res, next) => {
    try {
        const student = await Student.findOne({ userId: req.user.id }).populate('userId', 'name email');

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student record not found'
            });
        }

        if (!student.paymentVerified) {
            return res.status(400).json({
                success: false,
                error: 'Payment must be verified before QR generation'
            });
        }

        // Generate a new token if not exists
        if (!student.qrCodeToken) {
            student.qrCodeToken = crypto.randomBytes(32).toString('hex');
            student.qrCodeGenerated = true;
            await student.save();
        }

        // Create JWT payload for QR
        const payload = {
            id: student._id,
            matricNumber: student.matricNumber,
            name: student.userId.name,
            department: student.department,
            faculty: student.faculty,
            photoUrl: student.photoUrl,
            qrToken: student.qrCodeToken,
            timestamp: Date.now()
        };

        // Sign with QR encryption key
        const token = jwt.sign(payload, process.env.QR_ENCRYPTION_KEY, { expiresIn: '30d' });

        // Generate base64 QR image
        const qrImage = await QRCode.toDataURL(token, {
            errorCorrectionLevel: 'H',
            width: 400,
            margin: 1
        });

        res.status(200).json({
            success: true,
            data: {
                qrImage,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Verify QR code (Scan)
// @route   POST /api/v1/qr/verify
// @access  Private (Examiner)
export const verifyQR = async (req, res, next) => {
    try {
        const { qrData } = req.body;

        if (!qrData) {
            return res.status(400).json({
                success: false,
                error: 'No QR data provided'
            });
        }

        // Decode and verify JWT
        let decoded;
        try {
            decoded = jwt.verify(qrData, process.env.QR_ENCRYPTION_KEY);
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired QR code',
                code: 'INVALID_FORMAT'
            });
        }

        // Check student in DB
        const student = await Student.findById(decoded.id).populate('userId', 'name');

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found',
                code: 'STUDENT_NOT_FOUND'
            });
        }

        // Verify token match
        if (student.qrCodeToken !== decoded.qrToken) {
            return res.status(400).json({
                success: false,
                error: 'QR token mismatch. This QR might have been regenerated.',
                code: 'TOKEN_MISMATCH'
            });
        }

        // Check payment
        if (!student.paymentVerified) {
            return res.status(400).json({
                success: false,
                error: 'Payment not verified',
                code: 'PAYMENT_NOT_VERIFIED'
            });
        }

        // Check if already used
        if (student.qrCodeUsed) {
            return res.status(400).json({
                success: false,
                error: 'This QR has already been used for entry',
                code: 'ALREADY_USED',
                usedAt: student.qrCodeUsedAt
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: student._id,
                name: student.userId.name,
                matricNumber: student.matricNumber,
                department: student.department,
                faculty: student.faculty,
                photoUrl: student.photoUrl,
                level: student.level
            }
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};
