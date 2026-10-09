import User from '../models/userModel.js';
import Listing from '../models/listingModel.js';
import Booking from '../models/bookingModel.js';
import Notification from '../models/notificationModel.js';
import Message from '../models/messageModel.js';

const DEMO_USERS = [
  ['Aarav Sharma', 'demo01@shipspace.demo', 'BlueRoute Logistics'],
  ['Diya Mehta', 'demo02@shipspace.demo', 'OceanBridge Cargo'],
  ['Kabir Singh', 'demo03@shipspace.demo', 'NorthStar Freight'],
  ['Ananya Rao', 'demo04@shipspace.demo', 'CargoNova'],
  ['Vihaan Kapoor', 'demo05@shipspace.demo', 'HarborLink'],
  ['Ishita Verma', 'demo06@shipspace.demo', 'SwiftContainer'],
  ['Arjun Malhotra', 'demo07@shipspace.demo', 'GlobalHaul'],
  ['Meera Nair', 'demo08@shipspace.demo', 'SeaLine Traders'],
  ['Reyansh Gupta', 'demo09@shipspace.demo', 'PortPulse'],
  ['Sara Khan', 'demo10@shipspace.demo', 'TransAxis'],
  ['Aditya Joshi', 'demo11@shipspace.demo', 'FreightFlow'],
  ['Kiara Patel', 'demo12@shipspace.demo', 'RouteCraft'],
];

const ROUTES = [
  ['Mumbai', 'Dubai'],
  ['Singapore', 'Rotterdam'],
  ['Shanghai', 'Hamburg'],
  ['Chennai', 'Colombo'],
  ['Nhava Sheva', 'Jebel Ali'],
  ['Kochi', 'Singapore'],
];

const bootstrapDemoData = async () => {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const demoPassword = process.env.DEMO_USER_PASSWORD;
  const seedDemoUsers = process.env.SEED_DEMO_USERS === 'true';

  if (adminEmail && adminPassword) {
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'ShipSpace Administrator',
        email: adminEmail,
        password: adminPassword,
        companyName: 'ShipSpace',
        role: 'admin',
        verificationStatus: 'verified',
        subscriptionTier: 'Enterprise',
      });
      console.log(`Admin account created: ${adminEmail}`);
    } else if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
    }
  }

  // Backfill legacy bookings created before seller/payment fields were added.
  const legacyBookings = await Booking.find({ $or: [{ seller: { $exists: false } }, { seller: null }] });
  for (const booking of legacyBookings) {
    const listing = await Listing.findById(booking.listing).select('user');
    if (!listing) continue;
    booking.seller = listing.user;
    if (!booking.paymentStatus) booking.paymentStatus = 'unpaid';
    await booking.save();
  }

  if (!seedDemoUsers) return;
  if (!demoPassword || demoPassword.length < 6) {
    console.warn('SEED_DEMO_USERS=true but DEMO_USER_PASSWORD is missing or too short.');
    return;
  }

  for (const [name, email, companyName] of DEMO_USERS) {
    if (await User.exists({ email })) continue;
    await User.create({
      name,
      email,
      companyName,
      password: demoPassword,
      role: 'user',
      verificationStatus: 'verified',
      subscriptionTier: 'Basic',
    });
  }

  const demoAccounts = await User.find({ email: { $in: DEMO_USERS.map(([, email]) => email) } }).sort({ email: 1 });
  const demoIds = demoAccounts.map(user => user._id);
  let listingsCreated = 0;

  for (let i = 0; i < demoAccounts.length; i += 1) {
    const account = demoAccounts[i];
    const existingCount = await Listing.countDocuments({ user: account._id });
    for (let j = existingCount; j < 2; j += 1) {
      const route = ROUTES[(i + j) % ROUTES.length];
      await Listing.create({
        user: account._id,
        companyName: account.companyName,
        origin: route[0],
        destination: route[1],
        availableCBM: 6 + ((i * 2 + j * 3) % 10),
        availableWeightKG: 1800 + ((i * 450 + j * 700) % 4200),
        departureDate: new Date(Date.now() + (10 + i * 2 + j * 7) * 86400000),
        pricePerCBM: 120 + ((i * 17 + j * 35) % 180),
        cargoType: j % 2 === 0 ? 'General' : 'Food-Grade',
      });
      listingsCreated += 1;
    }
  }

  // Keep demo booking history repeatable and representative of the current request workflow.
  // No demo booking is marked paid: checkout and invoice issuance remain disabled.
  const demoBookings = [];
  for (let i = 0; i < demoAccounts.length; i += 1) {
    const buyer = demoAccounts[i];

    // Convert the old seeded "confirmed but unpaid" record to the current accepted state.
    const oldSeedBooking = await Booking.findOne({
      buyer: buyer._id,
      seller: { $in: demoIds },
      paymentStatus: { $ne: 'paid' },
    }).sort({ createdAt: 1 });
    if (oldSeedBooking?.status === 'confirmed') {
      oldSeedBooking.status = 'accepted';
      await oldSeedBooking.save();
    }

    const partners = [(i + 1) % demoAccounts.length, (i + 2) % demoAccounts.length];
    for (let j = 0; j < partners.length; j += 1) {
      const seller = demoAccounts[partners[j]];
      const listing = await Listing.findOne({ user: seller._id }).sort({ createdAt: 1 });
      if (!listing) continue;

      let booking = await Booking.findOne({ buyer: buyer._id, seller: seller._id, listing: listing._id });
      if (!booking) {
        const quantityCBM = 1 + ((i + j) % 2);
        const statuses = ['pending', 'accepted', 'rejected', 'cancelled'];
        const status = j === 0 ? (i % 4 === 0 ? 'pending' : 'accepted') : statuses[i % statuses.length];
        if (status === 'accepted') {
          const reserved = await Listing.findOneAndUpdate(
            { _id: listing._id, availableCBM: { $gte: quantityCBM } },
            { $inc: { availableCBM: -quantityCBM } },
            { new: true }
          );
          if (!reserved) continue;
        }
        booking = await Booking.create({
          listing: listing._id,
          buyer: buyer._id,
          seller: seller._id,
          quantityCBM,
          amount: Number((quantityCBM * listing.pricePerCBM).toFixed(2)),
          status,
          paymentStatus: 'unpaid',
          sellerNote: status === 'accepted' ? 'Demo request accepted; payment is not enabled.' : '',
          createdAt: new Date(Date.now() - (i * 2 + j + 1) * 86400000),
        });
      }
      demoBookings.push(booking);
    }
  }

  // Seed a conversation and related notification for each demo booking, but only once.
  let conversationsCreated = 0;
  let notificationsCreated = 0;
  for (const booking of demoBookings) {
    const messageCount = await Message.countDocuments({ booking: booking._id });
    if (messageCount === 0) {
      const buyer = demoAccounts.find(user => String(user._id) === String(booking.buyer));
      const seller = demoAccounts.find(user => String(user._id) === String(booking.seller));
      if (buyer && seller) {
        await Message.create([
          { booking: booking._id, sender: buyer._id, recipient: seller._id, body: 'Hello! I would like to coordinate the shipment details for this booking.' },
          { booking: booking._id, sender: seller._id, recipient: buyer._id, body: booking.status === 'accepted' ? 'Thanks for the request. The space is reserved; payment is not enabled yet.' : 'Thanks for reaching out. I will review the request and confirm the details.' },
        ]);
        conversationsCreated += 1;
      }
    }

    const hasBookingNotification = await Notification.exists({ relatedBooking: booking._id });
    if (!hasBookingNotification) {
      await Notification.create({
        user: booking.seller,
        type: 'booking_request',
        title: 'Demo booking activity',
        body: 'A demo buyer has activity on a sample container-space request.',
        link: '/dashboard',
        relatedBooking: booking._id,
      });
      await Notification.create({
        user: booking.buyer,
        type: booking.status === 'accepted' ? 'booking_accepted' : 'booking_request',
        title: booking.status === 'accepted' ? 'Demo request accepted' : 'Demo booking activity',
        body: booking.status === 'accepted'
          ? 'The sample request is accepted. Payment remains disabled.'
          : 'This is sample activity for exploring the booking workflow.',
        link: '/dashboard',
        relatedBooking: booking._id,
      });
      notificationsCreated += 2;
    }
  }

  console.log(
    `Demo data ready. Added ${listingsCreated} listings, prepared ${demoBookings.length} booking records, ${conversationsCreated} conversations and ${notificationsCreated} notifications.`
  );
};

export default bootstrapDemoData;
