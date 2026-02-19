import express from 'express';
import passport from 'passport';
import { register, login, googleCallback, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Email/password auth routes
router.post('/register', register);
router.post('/login', login);

// Google OAuth routes (optional — works only with real credentials)
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: (process.env.CLIENT_URL || 'http://localhost:5173') + '/?auth=error' }),
  googleCallback
);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
