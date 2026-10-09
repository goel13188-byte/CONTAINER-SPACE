import Listing from '../models/listingModel.js';
import Booking from '../models/bookingModel.js';

const ACTIVE_STATUSES = ['pending', 'accepted', 'confirmed'];

const getAnalyticsStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const [listings, bookings, allBookings] = await Promise.all([
      Listing.find({ user: userId }).select('origin destination availableCBM pricePerCBM createdAt departureDate'),
      Booking.find({ buyer: userId }).populate({ path: 'listing', select: 'user origin destination availableCBM pricePerCBM' }).sort({ createdAt: 1 }),
      Booking.find({ status: { $in: ACTIVE_STATUSES } }).populate({ path: 'listing', select: 'user origin destination availableCBM pricePerCBM' }).sort({ createdAt: 1 }),
    ]);

    const ownedBookings = allBookings.filter(
      booking => booking.listing && String(booking.listing.user) === String(userId)
    );
    const activeBuyerBookings = bookings.filter(booking => ACTIVE_STATUSES.includes(booking.status));
    const paidSellerBookings = ownedBookings.filter(
      booking => booking.status === 'confirmed' && booking.paymentStatus === 'paid'
    );

    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    const earnings30d = paidSellerBookings
      .filter(booking => new Date(booking.createdAt) >= cutoff)
      .reduce((sum, booking) => sum + Number(booking.amount || 0), 0);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const earningsData = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
      const value = paidSellerBookings
        .filter(booking => new Date(booking.createdAt) >= start && new Date(booking.createdAt) < end)
        .reduce((sum, booking) => sum + Number(booking.amount || 0), 0);
      earningsData.push({ name: monthNames[start.getMonth()], Earnings: Number(value.toFixed(2)) });
    }

    const utilizationData = listings.slice(0, 8).map(listing => {
      const booked = ownedBookings
        .filter(booking => booking.listing && String(booking.listing._id) === String(listing._id))
        .reduce((sum, booking) => sum + Number(booking.quantityCBM || 0), 0);
      const total = Number(listing.availableCBM || 0) + booked;
      return {
        name: listing.origin + ' → ' + listing.destination,
        Utilization: total > 0 ? Math.min(100, Math.round((booked / total) * 100)) : 0,
      };
    });

    const carbonVolume = activeBuyerBookings.reduce((sum, booking) => sum + Number(booking.quantityCBM || 0), 0);
    const totalListedCBM = listings.reduce((sum, listing) => sum + Number(listing.availableCBM || 0), 0);
    const totalListedValue = listings.reduce(
      (sum, listing) => sum + Number(listing.availableCBM || 0) * Number(listing.pricePerCBM || 0),
      0
    );

    res.json({
      myContainerCount: listings.length,
      myBookingsCount: activeBuyerBookings.length,
      earnings30d: Number(earnings30d.toFixed(2)),
      carbonSavings: Number((carbonVolume * 0.015).toFixed(2)),
      earningsData,
      utilizationData,
      totalListedCBM,
      totalListedValue,
      totalBookingValue: activeBuyerBookings.reduce((sum, booking) => sum + Number(booking.amount || 0), 0),
      hasListingData: listings.length > 0,
    });
  } catch (error) {
    console.error('Analytics error:', error.message);
    res.status(500).json({ message: 'Unable to calculate analytics right now.' });
  }
};

export { getAnalyticsStats };
