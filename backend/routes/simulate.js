const express = require('express');
const Groq = require('groq-sdk');
const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post('/', async (req, res) => {
  try {
    const { userProfile, scenario } = req.body;

    const prompt = `
You are an Indian financial advisor.
This person's current financial profile:
- Age: ${userProfile.age}
- Monthly Income: Rs.${userProfile.income}
- Monthly Expenses: Rs.${userProfile.expenses}
- Savings: Rs.${userProfile.savings}
- Goal: ${userProfile.goal}
- Risk: ${userProfile.risk}
- Current Money Health Score: ${userProfile.score}/100

Scenario to simulate: "${scenario}"

Analyze how this scenario affects their finances.
Respond ONLY in this exact JSON format:
{
  "newScore": <updated score 0-100>,
  "impact": "<2 sentences explaining the financial impact with rupee amounts>",
  "actions": [
    "<specific action they should take>",
    "<specific action they should take>",
    "<specific action they should take>"
  ]
}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    });

    const rawText = response.choices[0].message.content;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const result = JSON.parse(jsonMatch[0]);
    res.json({ success: true, result });

  } catch (error) {
    console.error('Simulate error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;