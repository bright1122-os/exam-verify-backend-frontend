import Student from '../models/Student.js';
import Payment from '../models/Payment.js';
import crypto from 'crypto';

// @desc    Initiate payment (generate RRR)
// @route   POST /api/v1/payment/initiate
// @access  Private (Student)
export const initiatePayment = async (req, res, next) => {
    try {
        const student = await Student.findOne({ userId: req.user.id });
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student record not found'
            });
        }

        // Check if already paid
        if (student.paymentVerified) {
            return res.status(400).json({
                success: false,
                error: 'Payment already verified'
            });
        }

        const orderId = `EXAM-${Date.now()}-${student.matricNumber}`;
        const amount = 15000;

        // Simulate RRR generation for now (since we don't have Remita keys yet)
        const rrr = Math.floor(100000000000 + Math.random() * 900000000000).toString();

        const payment = await Payment.create({
            studentId: student._id,
            orderId,
            rrr,
            amount,
            status: 'pending'
        });

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Verify payment
// @route   POST /api/v1/payment/verify/:rrr
// @access  Private (Student)
export const verifyPayment = async (req, res, next) => {
    try {
        const { rrr } = req.params;
        const payment = await Payment.findOne({ rrr });

        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment record not found'
            });
        }

        // Simulate successful verification
        payment.status = 'completed';
        payment.transactionDate = new Date();
        await payment.save();

        // Update student status
        await Student.findByIdAndUpdate(payment.studentId, {
            paymentVerified: true
        });

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            data: payment
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get latest payment status
// @route   GET /api/v1/payment/my-payment
// @access  Private (Student)
export const getMyPayment = async (req, res, next) => {
    try {
        const student = await Student.findOne({ userId: req.user.id });
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student record not found'
            });
        }

        const payment = await Payment.findOne({ studentId: student._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};
