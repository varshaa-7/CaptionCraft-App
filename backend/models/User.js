const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      default: null // null for Firebase/Google users
    },
    firebaseUid: {
      type: String,
      default: null,
      unique: true,
      sparse: true
    },
    displayName: {
      type: String,
      trim: true
    },
    subscription: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free'
    },
    quota: {
      captionsUsed: { type: Number, default: 0 },
      hashtagsUsed: { type: Number, default: 0 },
      bonusCaption: { type: Number, default: 0 },
      bonusHashtag: { type: Number, default: 0 },
      lastReset: { type: Date, default: Date.now }
    },
    history: [
      {
        topic: String,
        platform: String,
        tone: String,
        captions: [
          {
            text: String,
            hashtags: String
          }
        ],
        generatedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Get quota limits based on subscription
userSchema.methods.getQuotaLimits = function () {
  const base = this.subscription === 'pro'
    ? { captions: 100, hashtags: 500 }
    : { captions: 10, hashtags: 50 };
  return {
    captions: base.captions + (this.quota.bonusCaption || 0),
    hashtags: base.hashtags + (this.quota.bonusHashtag || 0)
  };
};

// Check if quota is exceeded
userSchema.methods.hasQuota = function (type) {
  const limits = this.getQuotaLimits();
  if (type === 'caption') return this.quota.captionsUsed < limits.captions;
  if (type === 'hashtag') return this.quota.hashtagsUsed < limits.hashtags;
  return false;
};

module.exports = mongoose.model('User', userSchema);
