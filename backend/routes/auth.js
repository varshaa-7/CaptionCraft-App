const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({ email, password, displayName });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        subscription: user.subscription,
        quota: user.quota
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        subscription: user.subscription,
        quota: user.quota
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/firebase  — Firebase / Google Sign-In
router.post('/firebase', async (req, res) => {
  try {
    const { firebaseUid, email, displayName } = req.body;
    if (!firebaseUid || !email)
      return res.status(400).json({ error: 'firebaseUid and email required' });

    let user = await User.findOne({ firebaseUid });
    if (!user) {
      // Check if email already exists (link accounts)
      user = await User.findOne({ email });
      if (user) {
        user.firebaseUid = firebaseUid;
        user.displayName = displayName || user.displayName;
        await user.save();
      } else {
        user = await User.create({ firebaseUid, email, displayName });
      }
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        subscription: user.subscription,
        quota: user.quota
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = req.user;
  const limits = user.getQuotaLimits();
  res.json({
    id: user._id,
    email: user.email,
    displayName: user.displayName,
    subscription: user.subscription,
    quota: user.quota,
    limits
  });
});

module.exports = router;
