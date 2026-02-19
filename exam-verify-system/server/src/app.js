import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Security Middleware ──
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(mongoSanitize());

// ── Rate Limiting ──
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// ── Common Middleware ──
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files ──
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// ── Base Route ──
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'ExamVerify API is running',
        version: '1.0.0'
    });
});

// ── Error Handling Middleware (Placeholder) ──
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Server Error'
    });
});

export default app;
