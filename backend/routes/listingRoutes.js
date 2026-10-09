 import express from 'express';
const router = express.Router();
import {
  getListings,
  getListingById,
  getMyListings,
  createListing,
  deleteListing,
} from '../controllers/listingController.js';
import { protect } from '../middleware/authMiddleware.js';

// Public route to get all listings
router.get('/', getListings);

// Private route to get user's own listings (must be before /:id)
router.get('/mylistings', protect, getMyListings);

// Public route for a single listing
router.get('/:id', getListingById);

// Private route to create a new listing
router.post('/', protect, createListing);

// Private route to delete a listing
router.delete('/:id', protect, deleteListing);

export default router;
