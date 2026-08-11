const dns = require('dns');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

// Fix Windows-only DNS SRV lookup issues for MongoDB Atlas
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (dnsErr) {
    console.log('DNS fallback setup notice:', dnsErr.message);
  }
}

const formatMongoUri = (uri) => {
  if (!uri) return 'mongodb://127.0.0.1:27017/hostel_db';
  let formatted = uri.trim();
  if (formatted.includes('mongodb.net/?')) {
    return formatted.replace('mongodb.net/?', 'mongodb.net/hostel_db?');
  }
  if (formatted.endsWith('mongodb.net/')) {
    return formatted + 'hostel_db';
  }
  if (formatted.endsWith('mongodb.net')) {
    return formatted + '/hostel_db';
  }
  return formatted;
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', resolve);
    });
    return;
  }
  try {
    const rawUri = process.env.MONGODB_URI;
    if (!rawUri) {
      console.warn('WARNING: MONGODB_URI environment variable is not defined. Falling back to local connection.');
    }

    const connStr = formatMongoUri(rawUri);
    console.log(`Connecting to MongoDB Atlas database...`);
    
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected successfully to cluster host: ${conn.connection.host}`);

    // Auto seed initial admin if database has zero admin accounts
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const defaultUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase().trim();
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      await Admin.create({
        username: defaultUsername,
        password: defaultPassword,
        name: 'Chief Warden Admin',
        role: 'Admin',
      });
      console.log(`Initial Admin Account Created -> Username: '${defaultUsername}' | Password: '${defaultPassword}'`);
    }

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error(`Please verify MONGODB_URI on Vercel Environment Variables and Atlas Network Access IP Whitelist (0.0.0.0/0).`);
  }
};

module.exports = connectDB;
