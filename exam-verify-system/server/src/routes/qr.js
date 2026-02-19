import express from 'express';
import { generateMyQR, verifyQR } from '../controllers/qr.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-qr', protect, authorize('student'), generateMyQR);
router.post('/verify', protect, authorize('examiner', 'admin'), verifyQR);

export default router;
