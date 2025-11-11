 import express from 'express';
const router = express.Router();
import {
  getListings,
  getMyListings,
  createListing,
  deleteListing,
} from '../controllers/listingController.js';
import { protect } from '../middleware/authMiddleware.js';

// Public route to get all listings
router.get('/', getListings);

// Private route to get user's own listings
router.get('/mylistings', protect, getMyListings);

// Private route to create a new listing
router.post('/', protect, createListing);

// Private route to delete a listing
router.delete('/:id', protect, deleteListing);

export default router;
