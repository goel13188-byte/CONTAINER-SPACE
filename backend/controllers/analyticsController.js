import Listing from '../models/listingModel.js';
// We will need a Booking model here in the future
// import Booking from '../models/bookingModel.js';

// @desc    Get stats for the analytics dashboard
// @route   GET /api/analytics/stats
// @access  Private
const getAnalyticsStats = async (req, res) => {
  try {
    // 1. Get real data: "My Containers" count
    const myContainerCount = await Listing.countDocuments({ user: req.user._id });

    // --- MOCK DATA (FOR NOW) ---
    // To make these real, we need a "Bookings" collection in our database
    // to track successful transactions.
    const myBookingsCount = 8;
    const earnings30d = 2800;
    const carbonSavings = 1.2;
    const earningsData = [
      { name: 'Apr', Earnings: 1300 },
      { name: 'May', Earnings: 2100 },
      { name: 'Jun', Earnings: 2400 },
      { name: 'Jul', Earnings: 2000 },
      { name: 'Aug', Earnings: 2800 },
    ];
    const utilizationData = [
      { name: 'SG→RTM', Utilization: 75 },
      { name: 'LA→SHA', Utilization: 60 },
      { name: 'BOM→SG', Utilization: 82 },
    ];
    // --- END MOCK DATA ---

    res.json({
      myContainerCount,
      myBookingsCount,
      earnings30d,
      carbonSavings,
      earningsData,
      utilizationData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export { getAnalyticsStats };