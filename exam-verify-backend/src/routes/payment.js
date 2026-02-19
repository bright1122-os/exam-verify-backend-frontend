import express from 'express';
import {
  initiatePayment,
  verifyPayment,
  getMyPayment,
  remitaWebhook,
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Protected routes (students only)
router.post('/initiate', protect, authorize('student'), paymentLimiter, initiatePayment);
router.post('/verify/:rrr', protect, authorize('student'), verifyPayment);
router.get('/my-payment', protect, authorize('student'), getMyPayment);

// Webhook (public - Remita calls this)
router.post('/webhook', remitaWebhook);

export default router;
