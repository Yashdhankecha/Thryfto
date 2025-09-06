const express = require('express');
const router = express.Router();
const CommunityThought = require('../models/CommunityThought');

// Get all thoughts (latest first)
router.get('/thoughts', async (req, res) => {
  try {
    const thoughts = await CommunityThought.find().sort({ createdAt: -1 }).limit(50);
    res.json({ thoughts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch thoughts' });
  }
});

// Post a new thought
router.post('/thoughts', async (req, res) => {
  try {
    const { user, text } = req.body;
    if (!user || !text) return res.status(400).json({ error: 'User and text are required' });
    const thought = new CommunityThought({ user, text });
    await thought.save();
    res.status(201).json({ thought });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post thought' });
  }
});

module.exports = router; 