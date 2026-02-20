import Student from '../models/Student.js';
import Verification from '../models/Verification.js';
import { emitVerificationEvent } from '../socket/index.js';

// @desc    Approve student entry
// @route   POST /api/v1/examiner/approve
// @access  Private (Examiner)
export const approveEntry = async (req, res, next) => {
    try {
        const { studentId, examHall } = req.body;

        const student = await Student.findById(studentId).populate('userId', 'name');
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        if (student.qrCodeUsed) {
            return res.status(400).json({
                success: false,
                error: 'Entry already approved for this student'
            });
        }

        // Update student
        student.qrCodeUsed = true;
        student.qrCodeUsedAt = new Date();
        await student.save();

        // Create verification record
        const verification = await Verification.create({
            studentId: student._id,
            examinerId: req.user.id,
            qrCodeToken: student.qrCodeToken,
            status: 'approved',
            examHall
        });

        // TODO: Emit Socket.io event verification:approved

        res.status(200).json({
            success: true,
            message: 'Entry approved successfully',
            data: verification
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Deny student entry
// @route   POST /api/v1/examiner/deny
// @access  Private (Examiner)
export const denyEntry = async (req, res, next) => {
    try {
        const { studentId, examHall, reason } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        // Create verification record
        const verification = await Verification.create({
            studentId: student._id,
            examinerId: req.user.id,
            qrCodeToken: student.qrCodeToken || 'N/A',
            status: 'denied',
            examHall,
            denialReason: reason
        });

        // TODO: Emit Socket.io event verification:denied

        res.status(200).json({
            success: true,
            message: 'Entry denied',
            data: verification
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get examiner stats
// @route   GET /api/v1/examiner/stats
// @access  Private (Examiner)
export const getExaminerStats = async (req, res, next) => {
    try {
        const totalScans = await Verification.countDocuments({ examinerId: req.user.id });
        const approved = await Verification.countDocuments({ examinerId: req.user.id, status: 'approved' });
        const denied = await Verification.countDocuments({ examinerId: req.user.id, status: 'denied' });

        res.status(200).json({
            success: true,
            data: {
                totalScans,
                approved,
                denied
            }
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get scan history
// @route   GET /api/v1/examiner/history
// @access  Private (Examiner)
export const getScanHistory = async (req, res, next) => {
    try {
        const history = await Verification.find({ examinerId: req.user.id })
            .populate('studentId')
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};
