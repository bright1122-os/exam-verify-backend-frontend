import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// ── Cached MongoDB connection (required for Vercel serverless) ──
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    }).then((m) => {
      console.log('MongoDB connected');
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const app = express();

// ── Security ──
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(mongoSanitize());

// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again after 15 minutes',
});
app.use('/api', limiter);

// ── Body Parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Connect to DB before every request ──
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err.message);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
});

// ── Routes ──
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import paymentRoutes from './routes/payment.js';
import qrRoutes from './routes/qr.js';
import examinerRoutes from './routes/examiner.js';
import adminRoutes from './routes/admin.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/qr', qrRoutes);
app.use('/api/v1/examiner', examinerRoutes);
app.use('/api/v1/admin', adminRoutes);

// ── Health Check ──
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ExamVerify API is running' });
});

// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

export default app;
