import express from 'express';
import { getMyQRCode, verifyQR } from '../controllers/qrController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Student route
router.get('/my-qr', protect, authorize('student'), getMyQRCode);

// Examiner route
router.post('/verify', protect, authorize('examiner', 'admin'), verifyQR);

export default router;
