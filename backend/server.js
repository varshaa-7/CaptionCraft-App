require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const captionRoutes = require('./routes/captions');
const userRoutes = require('./routes/users');
const adRoutes = require('./routes/ads');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/captions', captionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ads', adRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Daily quota reset - runs every midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const result = await User.updateMany(
      {},
      {
        $set: {
          'quota.captionsUsed': 0,
          'quota.hashtagsUsed': 0,
          'quota.bonusCaption': 0,
          'quota.bonusHashtag': 0,
          'quota.lastReset': new Date()
        }
      }
    );
    console.log(`[CRON] Daily quota reset for ${result.modifiedCount} users`);
  } catch (err) {
    console.error('[CRON] Quota reset failed:', err.message);
  }
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
