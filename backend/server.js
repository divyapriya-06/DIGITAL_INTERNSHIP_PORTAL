import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initSocketIO } from './services/socketService.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import User from './models/User.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import industryRoutes from './routes/industryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import portalFeedbackRoutes from './routes/portalFeedbackRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocketIO(server);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads route
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Digital Internship and Industry Collaboration Management Portal API',
    timestamp: new Date(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', portalFeedbackRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Ensure default Admin exists in Database
const ensureDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Portal Administrator',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        phone: '+919876543210',
        isProfileComplete: true,
      });
      console.log('👑 Default Admin initialized: admin@gmail.com / admin123');
    }
  } catch (err) {
    console.error('Error ensuring admin user:', err.message);
  }
};

// Start Server after connecting to Database
const startServer = async () => {
  await connectDB();
  await ensureDefaultAdmin();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [http://localhost:${PORT}]`);
  });
};

startServer();

export { app, server };
