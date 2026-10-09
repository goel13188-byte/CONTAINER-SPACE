import Listing from '../models/listingModel.js';
import User from '../models/userModel.js'; // --- ADD THIS IMPORT ---

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res) => {
  try {
    const listings = await Listing.find({}).populate('user', 'name companyName');
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get one listing with public seller details
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid listing ID.' });
    }
    const listing = await Listing.findById(req.params.id)
      .populate('user', 'name companyName verificationStatus subscriptionTier createdAt');
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    res.json(listing);
  } catch (error) {
    console.error('Get listing details error:', error.message);
    res.status(500).json({ message: 'Unable to load listing details.' });
  }
};

// @desc    Get listings for the logged-in user
// @route   GET /api/listings/mylistings
// @access  Private
const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ user: req.user._id });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res) => {
  try {
    // --- ADD PRICING LOGIC ---
    const FREE_TIER_LIMIT = 5;
    const user = await User.findById(req.user._id); // Get fresh user data

    if (user.subscriptionTier === 'Basic') {
      const listingCount = await Listing.countDocuments({ user: req.user._id });
      if (listingCount >= FREE_TIER_LIMIT) {
        return res.status(403).json({ // 403 Forbidden
          message: 'You have reached your 5-listing limit. Please upgrade to Pro to post more.',
        });
      }
    }
    // --- END PRICING LOGIC ---

    const {
      origin,
      destination,
      availableCBM,
      availableWeightKG,
      departureDate,
      pricePerCBM,
      cargoType,
    } = req.body;

    const listing = new Listing({
      user: req.user._id,
      companyName: req.user.companyName, // Get company name from logged-in user
      origin,
      destination,
      availableCBM,
      availableWeightKG,
      departureDate,
      pricePerCBM,
      cargoType,
    });

    const createdListing = await listing.save();
    res.status(201).json(createdListing);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid listing data' });
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if listing belongs to the user
    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await listing.deleteOne(); // Use deleteOne()
    res.json({ message: 'Listing removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


export { getListings, getListingById, getMyListings, createListing, deleteListing };