import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import { testDbConnection } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import movementRoutes from './routes/movementRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import masterRoutes from './routes/masterRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static directory untuk file upload lampiran / foto
const uploadsPath = path.resolve(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend Ko+Lab Logistik API berjalan lancar',
    timestamp: new Date().toISOString()
  });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/master', masterRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server'
  });
});

// Jalankan Server & Test DB Connection
app.listen(PORT, async () => {
  console.log(`🚀 Server Backend Ko+Lab aktif di http://localhost:${PORT}`);
  await testDbConnection();
});
