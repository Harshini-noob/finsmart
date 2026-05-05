const express = require('express');
const Score = require('../models/Score');
const protect = require('../middleware/auth');
const router = express.Router();

// Save score after analysis
router.post('/', protect, async (req, res) => {
  try {
    const { score, scoreLabel, income, expenses, savings, analysis } = req.body;

    const month = new Date().toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric'
    });

    // Check if score exists for this month
    const existing = await Score.findOne({
      userId: req.user._id,
      month
    });

    if (existing) {
      // Update existing
      existing.score = score;
      existing.scoreLabel = scoreLabel;
      existing.analysis = analysis;
      await existing.save();
      return res.json({ success: true, score: existing });
    }

    // Create new
    const newScore = new Score({
      userId: req.user._id,
      score, scoreLabel,
      income, expenses, savings,
      analysis, month
    });
    await newScore.save();

    res.json({ success: true, score: newScore });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get score history
router.get('/history', protect, async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.user._id })
      .sort({ createdAt: 1 })
      .limit(12);

    res.json({ success: true, scores });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;