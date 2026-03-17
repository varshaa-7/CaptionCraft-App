const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/quota
router.get('/quota', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const limits = user.getQuotaLimits();

    // Auto-reset if last reset was not today
    const lastReset = new Date(user.quota.lastReset);
    const today = new Date();
    const isSameDay =
      lastReset.getDate() === today.getDate() &&
      lastReset.getMonth() === today.getMonth() &&
      lastReset.getFullYear() === today.getFullYear();

    if (!isSameDay) {
      user.quota.captionsUsed = 0;
      user.quota.hashtagsUsed = 0;
      user.quota.bonusCaption = 0;
      user.quota.bonusHashtag = 0;
      user.quota.lastReset = new Date();
      await user.save();
    }

    // Calculate time until midnight
    const midnight = new Date(today);
    midnight.setHours(24, 0, 0, 0);
    const msUntilReset = midnight - Date.now();
    const hoursLeft = Math.floor(msUntilReset / 3600000);
    const minutesLeft = Math.floor((msUntilReset % 3600000) / 60000);

    res.json({
      quota: user.quota,
      limits,
      resetIn: `${hoursLeft}h ${minutesLeft}m`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { displayName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { displayName } },
      { new: true }
    ).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
