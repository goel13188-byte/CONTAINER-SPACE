import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import listingRoutes from './routes/listingRoutes.js'; // Import listing routes
import analyticsRoutes from './routes/analyticsRoutes.js'; // --- ADD THIS ---

dotenv.config();
connectDB();

const app = express();

app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To accept JSON data in the body

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Mount Routes
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes); // Add this line
app.use('/api/analytics', analyticsRoutes); // --- ADD THIS ---

const PORT = process.env.PORT || 5001;
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);