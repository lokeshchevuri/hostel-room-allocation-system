const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Express Middleware
app.use(cors());
app.use(express.json());

// Middleware to ensure DB connection is ready on every request (especially Vercel serverless functions)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection middleware error:', err);
    next();
  }
});

// Auto seed initial admin if database is empty
const seedInitialAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      await Admin.create({
        username: defaultUsername,
        password: defaultPassword,
        name: 'Chief Warden Admin',
        role: 'Admin',
      });
      console.log(`Default Admin Account Seeded! Username: '${defaultUsername}' | Password: '${defaultPassword}'`);
    }
  } catch (err) {
    console.error('Admin auto-seed notice:', err.message);
  }
};

// Delay check slightly until DB connection settles
setTimeout(seedInitialAdmin, 2000);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/allocations', require('./routes/allocationRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// API Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Hostel Room Allocation System API',
    timestamp: new Date(),
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Hostel Management Server running on port ${PORT}`);
  });
}

module.exports = app;
