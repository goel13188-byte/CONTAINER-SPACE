import express from 'express';
const router = express.Router();
import { getAnalyticsStats } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

// Private route to get analytics stats
router.get('/stats', protect, getAnalyticsStats);

export default router;