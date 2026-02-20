import express from 'express';
import {
  scanQR,
  approveEntry,
  denyEntry,
  getHistory,
  getStats,
} from '../controllers/examinerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('examiner', 'admin'));

router.post('/scan', scanQR);
router.post('/approve', approveEntry);
router.post('/deny', denyEntry);
router.get('/history', getHistory);
router.get('/stats', getStats);

export default router;
