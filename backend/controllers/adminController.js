import User from '../models/userModel.js';
import Listing from '../models/listingModel.js';
import Booking from '../models/bookingModel.js';

// @route GET /api/admin/users
const listUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ message: 'Unable to load users.' });
  }
};

// @route GET /api/admin/users/:id/overview
const getUserOverview = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const [listings, purchases] = await Promise.all([
      Listing.find({ user: user._id }).sort({ createdAt: -1 }),
      Booking.find({ buyer: user._id })
        .populate('listing', 'origin destination companyName pricePerCBM departureDate')
        .sort({ createdAt: -1 }),
    ]);

    const totalListedValue = listings.reduce(
      (sum, item) => sum + Number(item.availableCBM || 0) * Number(item.pricePerCBM || 0),
      0
    );
    const totalListedCBM = listings.reduce(
      (sum, item) => sum + Number(item.availableCBM || 0),
      0
    );
    const totalSpent = purchases
      .filter((item) => item.status !== 'cancelled')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalPurchasedCBM = purchases
      .filter((item) => item.status !== 'cancelled')
      .reduce((sum, item) => sum + Number(item.quantityCBM || 0), 0);

    res.json({
      user,
      summary: {
        listingCount: listings.length,
        totalListedCBM,
        averageListingPrice: listings.length
          ? totalListedValue / Math.max(totalListedCBM, 1)
          : 0,
        totalListedValue,
        purchaseCount: purchases.filter((item) => item.status !== 'cancelled').length,
        totalPurchasedCBM,
        totalSpent,
      },
      listings,
      purchases,
    });
  } catch (error) {
    console.error('Admin user overview error:', error);
    res.status(500).json({ message: 'Unable to load user activity.' });
  }
};

// @route PATCH /api/admin/users/:id/role
const updateRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    if (String(req.user._id) === req.params.id && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot remove your own admin role.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Admin role update error:', error);
    res.status(500).json({ message: 'Unable to update role.' });
  }
};

// @route PATCH /api/admin/users/:id/reset-password
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Admin password reset error:', error);
    res.status(500).json({ message: 'Unable to reset password.' });
  }
};


const getPlatformAnalytics = async (req, res) => {
  try {
    const configuredRate = Number(process.env.PLATFORM_FEE_PERCENT ?? 2);
    const feePercent = Number.isFinite(configuredRate) && configuredRate >= 0 && configuredRate <= 10
      ? configuredRate
      : 2;

    const [usersCount, listingsCount, bookings, recentBookings] = await Promise.all([
      User.countDocuments({}),
      Listing.countDocuments({}),
      Booking.find({}).select('amount status paymentStatus createdAt'),
      Booking.find({})
        .populate('buyer', 'name email')
        .populate('seller', 'name companyName')
        .populate('listing', 'origin destination')
        .sort({ createdAt: -1 })
        .limit(12),
    ]);

    const paidBookings = bookings.filter(item => item.paymentStatus === 'paid' && item.status === 'confirmed');
    const activeUnpaidBookings = bookings.filter(
      item => ['pending', 'accepted'].includes(item.status) && item.paymentStatus !== 'paid'
    );
    const paidGross = paidBookings.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const estimatedGross = activeUnpaidBookings.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const platformRevenue = paidGross * feePercent / 100;
    const potentialFee = estimatedGross * feePercent / 100;

    res.json({
      feePercent,
      usersCount,
      listingsCount,
      bookingCount: bookings.length,
      paidBookingCount: paidBookings.length,
      activeUnpaidCount: activeUnpaidBookings.length,
      paidGross: Number(paidGross.toFixed(2)),
      platformRevenue: Number(platformRevenue.toFixed(2)),
      estimatedGross: Number(estimatedGross.toFixed(2)),
      potentialFee: Number(potentialFee.toFixed(2)),
      recentBookings,
    });
  } catch (error) {
    console.error('Admin platform analytics error:', error);
    res.status(500).json({ message: 'Unable to load platform analytics.' });
  }
};

export { listUsers, getUserOverview, updateRole, resetPassword, getPlatformAnalytics };
