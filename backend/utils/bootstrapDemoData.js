import User from '../models/userModel.js';

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

  let created = 0;

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

    created += 1;
  }

  console.log(`Demo user seed complete. Created ${created} new demo users.`);
};

export default bootstrapDemoData;
