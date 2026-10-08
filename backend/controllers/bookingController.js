import Booking from '../models/bookingModel.js';
import Listing from '../models/listingModel.js';

const createBooking = async (req, res) => {
  try {
    const { listingId, quantityCBM = 1 } = req.body;
    const quantity = Number(quantityCBM);

    if (!listingId || !Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'A valid listing and quantity are required.' });
    }

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    if (String(listing.user) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot book your own listing.' });
    }

    if (quantity > listing.availableCBM) {
      return res.status(400).json({ message: 'Requested space exceeds available CBM.' });
    }

    const amount = Number((quantity * listing.pricePerCBM).toFixed(2));

    const booking = await Booking.create({
      listing: listing._id,
      buyer: req.user._id,
      quantityCBM: quantity,
      amount,
      status: 'confirmed',
    });

    res.status(201).json(await booking.populate('listing', 'origin destination pricePerCBM companyName'));
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ message: 'Unable to book space right now.' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ buyer: req.user._id })
      .populate('listing', 'origin destination pricePerCBM companyName departureDate')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Booking history error:', error);
    res.status(500).json({ message: 'Unable to load booking history.' });
  }
};

export { createBooking, getMyBookings };
