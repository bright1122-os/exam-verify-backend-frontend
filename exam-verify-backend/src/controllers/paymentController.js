import Payment from '../models/Payment.js';
import Student from '../models/Student.js';
import remitaService from '../services/remitaService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';
import { generateQRCode } from '../services/qrService.js';
import { sendPaymentConfirmation } from '../services/emailService.js';

// @desc    Initiate payment (generate RRR)
// @route   POST /api/v1/payment/initiate
// @access  Private (Student)
export const initiatePayment = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return errorResponse(res, 'Student profile not found. Complete registration first.', 404);
    }

    if (!student.registrationComplete) {
      return errorResponse(res, 'Complete registration before initiating payment', 400);
    }

    const existingPayment = await Payment.findOne({
      studentId: student._id,
      status: { $in: ['completed', 'processing'] }
    });

    if (existingPayment) {
      return errorResponse(res, 'You already have an active payment', 400);
    }

    const orderId = `EXAM-${Date.now()}-${student.matricNumber}`;
    const amount = 15000;

    const rrr = await remitaService.generateRRR({
      orderId,
      amount,
      payerName: req.user.name,
      payerEmail: req.user.email,
      payerPhone: '0000000000',
      description: 'Exam Registration Fee',
    });

    if (!rrr.success) {
      return errorResponse(res, rrr.error, 500);
    }

    const payment = await Payment.create({
      studentId: student._id,
      orderId,
      rrr: rrr.rrr,
      amount,
      status: 'pending',
    });

    logger.info(`Payment initiated for student ${student.matricNumber}: RRR ${rrr.rrr}`);

    successResponse(res, {
      payment: {
        orderId: payment.orderId,
        rrr: payment.rrr,
        amount: payment.amount,
        status: payment.status,
      },
      remitaPaymentUrl: `https://remitademo.net/remita/ecomm/finalize.reg?merchantId=${process.env.REMITA_MERCHANT_ID}&hash=${rrr.rrr}`,
    }, 'Payment initiated successfully', 201);

  } catch (error) {
    logger.error('Payment initiation error:', error);
    errorResponse(res, 'Failed to initiate payment');
  }
};

// @desc    Verify payment status
// @route   POST /api/v1/payment/verify/:rrr
// @access  Private (Student)
export const verifyPayment = async (req, res) => {
  try {
    const { rrr } = req.params;

    const payment = await Payment.findOne({ rrr }).populate('studentId');

    if (!payment) {
      return errorResponse(res, 'Payment record not found', 404);
    }

    if (payment.studentId.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Unauthorized access to payment', 403);
    }

    if (payment.status === 'completed') {
      return successResponse(res, {
        payment: {
          status: 'completed',
          amount: payment.amount,
          transactionDate: payment.transactionDate,
        },
        qrGenerated: payment.studentId.qrCodeGenerated,
      }, 'Payment already verified');
    }

    const statusCheck = await remitaService.checkPaymentStatus(rrr);

    if (!statusCheck.success) {
      payment.status = 'failed';
      payment.remitaStatus = statusCheck.status;
      payment.remitaResponse = statusCheck.rawData;
      await payment.save();

      return errorResponse(res, statusCheck.error || 'Payment verification failed', 400);
    }

    payment.status = 'completed';
    payment.transactionDate = statusCheck.transactionDate || new Date();
    payment.remitaStatus = statusCheck.status;
    payment.remitaResponse = statusCheck.rawData;
    await payment.save();

    payment.studentId.paymentVerified = true;
    await payment.studentId.save();

    const qrResult = await generateQRCode(payment.studentId._id);

    logger.info(`Payment verified for student ${payment.studentId.matricNumber}`);

    // Send payment confirmation email (non-blocking)
    const studentWithUser = await Student.findById(payment.studentId._id).populate('userId', 'name email');
    if (studentWithUser?.userId?.email) {
      sendPaymentConfirmation(
        { name: studentWithUser.userId.name, email: studentWithUser.userId.email },
        payment
      ).catch(err => logger.error('Payment confirmation email failed:', err));
    }

    successResponse(res, {
      payment: {
        status: 'completed',
        amount: payment.amount,
        transactionDate: payment.transactionDate,
      },
      qrCode: qrResult.qrCode,
      message: 'Payment verified successfully. QR code generated.',
    });

  } catch (error) {
    logger.error('Payment verification error:', error);
    errorResponse(res, 'Failed to verify payment');
  }
};

// @desc    Get payment details
// @route   GET /api/v1/payment/my-payment
// @access  Private (Student)
export const getMyPayment = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });

    if (!student) {
      return errorResponse(res, 'Student profile not found', 404);
    }

    const payment = await Payment.findOne({ studentId: student._id })
      .sort({ createdAt: -1 });

    if (!payment) {
      return errorResponse(res, 'No payment found', 404);
    }

    successResponse(res, { payment });

  } catch (error) {
    logger.error('Get payment error:', error);
    errorResponse(res, 'Failed to fetch payment');
  }
};

// @desc    Remita webhook (payment notification)
// @route   POST /api/v1/payment/webhook
// @access  Public (Remita only)
export const remitaWebhook = async (req, res) => {
  try {
    const { RRR, status, hash } = req.body;

    const isValid = remitaService.verifyWebhookSignature(req.body, hash);

    if (!isValid) {
      logger.warn('Invalid Remita webhook signature');
      return res.status(401).send('Unauthorized');
    }

    const payment = await Payment.findOne({ rrr: RRR });

    if (!payment) {
      logger.warn(`Webhook received for unknown RRR: ${RRR}`);
      return res.status(404).send('Payment not found');
    }

    if (status === '00' || status === '01') {
      payment.status = 'completed';
      payment.remitaStatus = status;
      payment.transactionDate = new Date();
      await payment.save();

      const student = await Student.findById(payment.studentId);
      student.paymentVerified = true;
      await student.save();

      await generateQRCode(student._id);

      logger.info(`Webhook: Payment completed for RRR ${RRR}`);
    }

    res.status(200).send('OK');

  } catch (error) {
    logger.error('Remita webhook error:', error);
    res.status(500).send('Error');
  }
};
