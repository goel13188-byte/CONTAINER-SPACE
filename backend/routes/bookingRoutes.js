import express from 'express';
import { createBooking, getMyBookings } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', createBooking);
router.get('/mine', getMyBookings);

export default router;
