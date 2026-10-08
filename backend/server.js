import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import bootstrapDemoData from './utils/bootstrapDemoData.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Container Space API is running.' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'container-space-backend',
    chatbotConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    await bootstrapDemoData();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
