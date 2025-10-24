import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/error';
import { generalLimiter } from './middleware/rateLimit';

// Routes
import authRoutes from './routes/auth.routes';
import bookingRoutes from './routes/booking.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
app.use(generalLimiter);

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Simple CRUD routes for services, therapists, etc.
// Services
app.get('/api/services', async (req, res) => {
  try {
    const { db } = await import('./config/db');
    const services = await db('services').where('is_active', true);
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// Therapists
app.get('/api/therapists', async (req, res) => {
  try {
    const { db } = await import('./config/db');
    const therapists = await db('therapists').where('is_active', true);
    res.json({ therapists });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// Promotions
app.get('/api/promotions', async (req, res) => {
  try {
    const { db } = await import('./config/db');
    const today = new Date().toISOString().split('T')[0];
    const promotions = await db('promotions')
      .where('is_active', true)
      .where('start_date', '<=', today)
      .where('end_date', '>=', today);
    res.json({ promotions });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// Gallery
app.get('/api/gallery', async (req, res) => {
  try {
    const { db } = await import('./config/db');
    const gallery = await db('gallery').where('is_active', true);
    res.json({ gallery });
  } catch (error) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
