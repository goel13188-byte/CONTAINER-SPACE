import User from '../models/userModel.js';
import Listing from '../models/listingModel.js';
import Booking from '../models/bookingModel.js';

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

  const demoAccounts = await User.find({
    email: { $in: DEMO_USERS.map(([, email]) => email) },
  }).sort({ email: 1 });

  let listingsCreated = 0;

  for (let i = 0; i < demoAccounts.length; i += 1) {
    const account = demoAccounts[i];
    const existingCount = await Listing.countDocuments({ user: account._id });

    if (existingCount >= 2) continue;

    const needed = 2 - existingCount;

    for (let j = 0; j < needed; j += 1) {
      const route = ROUTES[(i + j) % ROUTES.length];
      const listingNumber = existingCount + j + 1;

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

  // Create realistic demo purchase history once, so the admin can demonstrate spend analytics.
  for (let i = 0; i < demoAccounts.length; i += 1) {
    const buyer = demoAccounts[i];
    const existingPurchase = await Booking.exists({ buyer: buyer._id });

    if (existingPurchase) continue;

    const seller = demoAccounts[(i + 1) % demoAccounts.length];
    const listing = await Listing.findOne({ user: seller._id }).sort({ createdAt: 1 });

    if (!listing) continue;

    const quantityCBM = 1 + (i % 3);
    const amount = Number((quantityCBM * listing.pricePerCBM).toFixed(2));

    await Booking.create({
      listing: listing._id,
      buyer: buyer._id,
      seller: listing.user,
      quantityCBM,
      amount,
      status: 'confirmed',
      paymentStatus: 'unpaid',
      createdAt: new Date(Date.now() - (i + 1) * 86400000),
    });
  }

  console.log(`Demo data ready. Added ${listingsCreated} listings and purchase history for admin analytics.`);
};

export default bootstrapDemoData;
