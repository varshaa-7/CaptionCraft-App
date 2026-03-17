const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// POST /api/ads/reward
// Called after user watches a rewarded ad (verified server-side via AdMob receipt)
router.post('/reward', protect, async (req, res) => {
  try {
    const { rewardType, adToken } = req.body;
    // rewardType: 'caption' or 'hashtag'
    // In production: verify adToken with AdMob server-side verification

    if (!rewardType || !['caption', 'hashtag'].includes(rewardType)) {
      return res.status(400).json({ error: 'Invalid reward type' });
    }

    const user = await User.findById(req.user._id);

    // Daily cap on bonus rewards
    const MAX_DAILY_BONUS_CAPTIONS = 25;
    const MAX_DAILY_BONUS_HASHTAGS = 100;

    if (
      rewardType === 'caption' &&
      user.quota.bonusCaption >= MAX_DAILY_BONUS_CAPTIONS
    ) {
      return res.status(429).json({
        error: 'Maximum daily caption bonus reached'
      });
    }

    if (
      rewardType === 'hashtag' &&
      user.quota.bonusHashtag >= MAX_DAILY_BONUS_HASHTAGS
    ) {
      return res.status(429).json({
        error: 'Maximum daily hashtag bonus reached'
      });
    }

    if (rewardType === 'caption') {
      user.quota.bonusCaption += 5;
    } else {
      user.quota.bonusHashtag += 10;
    }

    await user.save();
    const limits = user.getQuotaLimits();

    res.json({
      message: `+${rewardType === 'caption' ? 5 : 10} ${rewardType}s added!`,
      quota: user.quota,
      limits
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
