import express from 'express';
import { initiatePayment, verifyPayment, getMyPayment } from '../controllers/payment.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.post('/initiate', initiatePayment);
router.post('/verify/:rrr', verifyPayment);
router.get('/my-payment', getMyPayment);

export default router;
