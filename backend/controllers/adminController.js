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

export { listUsers, getUserOverview, updateRole, resetPassword };
