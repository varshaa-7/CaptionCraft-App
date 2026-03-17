const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const CAPTION_LIMIT_PER_REQUEST = 5;

// POST /api/captions/generate
router.post('/generate', protect, async (req, res) => {
  try {
    const { topic, platform, tone } = req.body;

    if (!topic || !platform)
      return res.status(400).json({ error: 'topic and platform are required' });

    const user = await User.findById(req.user._id);
    const limits = user.getQuotaLimits();

    // Check caption quota
    if (user.quota.captionsUsed >= limits.captions) {
      return res.status(429).json({
        error: 'Daily caption limit reached. Watch an ad to earn more!',
        quota: {
          used: user.quota.captionsUsed,
          limit: limits.captions
        }
      });
    }

    // Check hashtag quota
    if (user.quota.hashtagsUsed >= limits.hashtags) {
      return res.status(429).json({
        error: 'Daily hashtag limit reached. Watch an ad to earn more!',
        quota: {
          used: user.quota.hashtagsUsed,
          limit: limits.hashtags
        }
      });
    }

    const platformPrompts = {
      instagram: 'casual, aesthetic, lifestyle-focused with trending hashtags',
      linkedin: 'professional, insightful, career-focused with professional hashtags',
      youtube: 'engaging, clickable, high-energy with video-centric hashtags',
      other: 'versatile, creative, audience-friendly with relevant hashtags'
    };

    const toneGuide = tone
      ? `The tone should be: ${tone}.`
      : 'Use a fun and engaging tone.';

    const platformGuide = platformPrompts[platform] || platformPrompts.other;

    const prompt = `You are a social media expert. Generate exactly ${CAPTION_LIMIT_PER_REQUEST} unique ${platform} captions for the topic: "${topic}".

Style: ${platformGuide}
${toneGuide}

Rules:
- Each caption must be 1-3 sentences, creative and engaging
- Include 5-10 relevant hashtags per caption
- Make captions feel authentic, not AI-generated
- Vary the style across the 5 captions
- Include relevant emojis

Respond ONLY with valid JSON in this exact format, no extra text:
{
  "captions": [
    { "text": "caption text here", "hashtags": "#tag1 #tag2 #tag3" },
    { "text": "caption text here", "hashtags": "#tag1 #tag2 #tag3" },
    { "text": "caption text here", "hashtags": "#tag1 #tag2 #tag3" },
    { "text": "caption text here", "hashtags": "#tag1 #tag2 #tag3" },
    { "text": "caption text here", "hashtags": "#tag1 #tag2 #tag3" }
  ]
}`;

    // Call Groq API
    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a creative social media expert. Always respond with valid JSON only — no markdown, no explanation, no code fences.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const rawContent = groqResponse.data.choices[0].message.content;

    // Parse JSON response
    let parsed;
    try {
      const clean = rawContent.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    const captions = parsed.captions || [];
    if (captions.length === 0)
      return res.status(500).json({ error: 'No captions generated' });

    // Count hashtags across all captions
    const totalHashtags = captions.reduce((acc, c) => {
      return acc + (c.hashtags ? c.hashtags.split(' ').filter(Boolean).length : 0);
    }, 0);

    // Update usage
    user.quota.captionsUsed += captions.length;
    user.quota.hashtagsUsed += totalHashtags;

    // Save to history (keep last 50)
    user.history.unshift({
      topic,
      platform,
      tone: tone || 'default',
      captions
    });
    if (user.history.length > 50) user.history = user.history.slice(0, 50);

    await user.save();

    const updatedLimits = user.getQuotaLimits();

    res.json({
      captions,
      quota: {
        captionsUsed: user.quota.captionsUsed,
        captionsLimit: updatedLimits.captions,
        hashtagsUsed: user.quota.hashtagsUsed,
        hashtagsLimit: updatedLimits.hashtags
      }
    });
  } catch (err) {
    if (err.response?.status === 401) {
      return res.status(500).json({ error: 'Invalid Groq API key. Check your GROQ_API_KEY in .env' });
    }
    if (err.response?.status === 429) {
      return res.status(429).json({ error: 'Groq rate limit hit. Please wait a moment and try again.' });
    }
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Groq API timed out. Please try again.' });
    }
    console.error('Caption generation error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to generate captions. Please try again.' });
  }
});

// GET /api/captions/history
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('history');
    res.json({ history: user.history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/captions/history
router.delete('/history', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { history: [] } });
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
