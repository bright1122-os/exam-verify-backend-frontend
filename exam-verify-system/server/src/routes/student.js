import express from 'express';
import { registerStudent, getStudentProfile, getStudentDashboard } from '../controllers/student.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.post('/register', upload.single('photo'), registerStudent);
router.get('/profile', getStudentProfile);
router.get('/dashboard', getStudentDashboard);

export default router;
