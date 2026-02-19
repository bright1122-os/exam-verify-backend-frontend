import express from 'express';
import {
  registerStudent,
  getProfile,
  updateProfile,
  getDashboard,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.post('/register', upload.single('photo'), handleMulterError, registerStudent);
router.get('/profile', getProfile);
router.put('/profile', upload.single('photo'), handleMulterError, updateProfile);
router.get('/dashboard', getDashboard);

export default router;
