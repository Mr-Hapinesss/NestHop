require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const { MONGODB_URI } = require('./config/env');
const User = require('./models/User');

const ADMIN = {
  name:     'Nesthop Admin',
  email:    'admin@nesthop.co.ke',
  password: 'Admin@1234',
  role:     'admin',
};

async function seed() {
  console.log('\n🌱  NestHop Admin Seeder\n');

  await mongoose.connect(MONGODB_URI);
  console.log('✅ MongoDB connected\n');

  const existing = await User.findOne({ email: ADMIN.email });

  if (existing) {
    console.log(`⚠️  Admin already exists: ${existing.name} (${existing.email})`);
    console.log('   Nothing was changed.\n');
    await mongoose.disconnect();
    process.exit(0);
  }

  const hashed = await bcrypt.hash(ADMIN.password, 12);

  const admin = await User.create({
    name:       ADMIN.name,
    email:      ADMIN.email,
    password:   hashed,
    role:       'admin',
    isVerified: true,
    isBanned:   false,
  });

  console.log('✅ Admin account created!');
  console.log('─────────────────────────────────────');
  console.log(`  Name     : ${admin.name}`);
  console.log(`  Email    : ${admin.email}`);
  console.log(`  Password : ${ADMIN.password}`);
  console.log(`  Role     : ${admin.role}`);
  console.log(`  ID       : ${admin._id}`);
  console.log('─────────────────────────────────────');
  console.log('\n👉  Sign in at /login with these credentials.\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeder failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});