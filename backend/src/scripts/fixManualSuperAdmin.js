const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const User = require('../models/User');

async function fixSuperAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is required in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const email = 'clichyb80@gmail.com';
    const rawPassword = '739866Clichy#';
    
    // Hash the password properly using bcrypt, matching the authController config
    const passwordHash = await bcrypt.hash(rawPassword, 12);

    let user = await User.findOne({ email });

    if (user) {
      console.log('User found in DB. Updating to proper hashed password and Super Admin status...');
      user.passwordHash = passwordHash;
      user.isSuperAdmin = true;
      user.isVerified = true;
      user.fullName = user.fullName || 'Super Admin';
      user.phone = user.phone || '+254700000000'; // Fallback just in case
      await user.save();
      console.log('✅ User updated successfully!');
    } else {
      console.log('User not found. Creating a fresh, properly hashed Super Admin user...');
      user = await User.create({
        fullName: 'Super Admin',
        email: email,
        phone: '+254700000000', // Set a default valid Kenyan number
        passwordHash: passwordHash,
        isVerified: true,
        isSuperAdmin: true
      });
      console.log('✅ User created successfully!');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error fixing super admin:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixSuperAdmin();
