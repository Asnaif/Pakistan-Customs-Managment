import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import pool from './config/database';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import metricsRoutes from './routes/metrics';
import shipmentsRoutes from './routes/shipments';
import rulesRoutes from './routes/rules';
import adminRoutes from './routes/admin';
import aiRoutes from './routes/ai';
import { requestId } from './middleware/requestId';

const app = express();
const port = process.env.PORT || 5000;


// Global Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());
app.use(requestId);

// Routes (SRS §15)
app.use('/api/v1', healthRoutes);
app.use('/api/v1', authRoutes);
app.use('/api/v1', metricsRoutes);
app.use('/api/v1', shipmentsRoutes);
app.use('/api/v1', rulesRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/v1', aiRoutes);

// Global Error Handler
import { errorHandler } from './middleware/errorHandler';
app.use(errorHandler);
app.listen(port, () => {
  console.log(`[PMM Backend] Server running on port ${port}`);
  console.log(`[PMM Backend] CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);

  pool.getConnection()
    .then((conn) => {
      console.log('[PMM Backend] Database connected successfully to MySQL.');
      conn.release();
    })
    .catch((err) => {
      console.error('[PMM Backend] WARNING: Database connection failed!');
      console.error('[PMM Backend] Error:', err.message);
      console.error('[PMM Backend] Please verify DATABASE_URL in backend/.env with your MySQL credentials.');
    });
});

