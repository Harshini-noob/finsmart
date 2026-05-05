const express = require('express');
const Goal = require('../models/Goal');
const Groq = require('groq-sdk');
const protect = require('../middleware/auth');
const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Create goal
router.post('/', protect, async (req, res) => {
  try {
    const { title, targetAmount, targetDate, category } = req.body;

    const target = new Date(targetDate);
    const now = new Date();
    const monthsLeft = Math.max(
      Math.ceil((target - now) / (1000 * 60 * 60 * 24 * 30)),
      1
    );
    const monthlyTarget = Math.ceil(targetAmount / monthsLeft);

    const goal = new Goal({
      userId: req.user._id,
      title,
      targetAmount: Number(targetAmount),
      targetDate,
      category,
      monthlyTarget,
      currentAmount: 0
    });

    await goal.save();
    res.json({ success: true, goal });

  } catch (error) {
    console.error('Create goal error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all goals
router.get('/', protect, async (req, res) => {
  try {
    const goals = await Goal.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    res.json({ success: true, goals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update goal progress manually
router.put('/:id', protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    // Update fields
    if (req.body.currentAmount !== undefined) {
      goal.currentAmount = Number(req.body.currentAmount);
    }
    if (req.body.status) {
      goal.status = req.body.status;
    }

    // Auto mark completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();
    res.json({ success: true, goal });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Auto update goals from bank transactions
router.post('/auto-update', protect, async (req, res) => {
  try {
    const { transactions } = req.body;

    // Get all active goals
    const goals = await Goal.find({
      userId: req.user._id,
      status: 'active'
    });

    if (goals.length === 0) {
      return res.json({
        success: true,
        message: 'No active goals',
        updated: 0
      });
    }

    // Find investment transactions
    const investmentKeywords = [
      'sip', 'mutual fund', 'ppf', 'nps', 'rd', 'fd',
      'recurring', 'investment', 'savings', 'elss'
    ];

    const investmentTxns = transactions.filter(t => {
      const desc = t.description.toLowerCase();
      return t.type === 'DEBIT' &&
        investmentKeywords.some(k => desc.includes(k));
    });

    const totalInvested = investmentTxns.reduce(
      (sum, t) => sum + t.amount, 0
    );

    // Use AI to match transactions to goals
    if (investmentTxns.length > 0 && goals.length > 0) {
      const prompt = `
You are a financial advisor.
User has these financial goals:
${goals.map((g, i) =>
  `${i+1}. ${g.title} (${g.category}) - Target: Rs.${g.targetAmount}`
).join('\n')}

These investment transactions happened this month:
${investmentTxns.map(t =>
  `- Rs.${t.amount} to ${t.description}`
).join('\n')}

Match each transaction to the most relevant goal.
Respond ONLY in JSON:
{
  "matches": [
    {
      "goalIndex": <0-based index>,
      "amount": <amount to add to that goal>
    }
  ]
}`;

      try {
        const response = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }]
        });

        const rawText = response.choices[0].message.content;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);

          // Update each matched goal
          for (const match of result.matches) {
            const goal = goals[match.goalIndex];
            if (goal) {
              goal.currentAmount += match.amount;
              if (goal.currentAmount >= goal.targetAmount) {
                goal.status = 'completed';
              }
              await goal.save();
            }
          }
        }
      } catch (aiErr) {
        console.error('AI matching error:', aiErr.message);
        // Fallback — add total to first goal
        if (goals[0] && totalInvested > 0) {
          goals[0].currentAmount += totalInvested;
          await goals[0].save();
        }
      }
    }

    // Fetch updated goals
    const updatedGoals = await Goal.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      updated: investmentTxns.length,
      totalInvested,
      goals: updatedGoals
    });

  } catch (error) {
    console.error('Auto update error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete goal
router.delete('/:id', protect, async (req, res) => {
  try {
    await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;