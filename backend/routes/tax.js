const express = require('express');
const Groq = require('groq-sdk');
const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const annualIncome = (
      (Number(data.basic) + Number(data.hra || 0) +
       Number(data.special || 0) + Number(data.other || 0)) * 12
    );

    const prompt = `
You are an expert Indian tax consultant.
Analyze this person's salary and find all tax saving opportunities.

Salary Structure (monthly):
- Basic: Rs.${data.basic}
- HRA: Rs.${data.hra || 0}
- Special Allowance: Rs.${data.special || 0}
- Other: Rs.${data.other || 0}
- Annual Income: Rs.${annualIncome}

Current situation:
- Already invested in 80C: Rs.${data.existing80c || 0}/year
- Has Health Insurance: ${data.hasHealthInsurance}
- Invests in NPS: ${data.hasNPS}
- Has Home Loan: ${data.homeLoan}
- Age: ${data.age}
- Goal: ${data.goal}

Calculate taxes and savings for Indian tax system FY 2025-26.
Respond ONLY in this exact JSON:
{
  "totalSavings": <total tax they can save in rupees>,
  "oldRegimeTax": <tax payable under old regime>,
  "newRegimeTax": <tax payable under new regime>,
  "betterRegime": <"old" or "new">,
  "deductions": [
    {
      "name": "<instrument name>",
      "section": "<80C/80D/80CCD etc>",
      "description": "<one line what it is>",
      "amount": <amount to invest>,
      "taxSaved": <tax saved in rupees>
    }
  ],
  "actionSteps": [
    "<specific action with amount and deadline>",
    "<specific action with amount and deadline>",
    "<specific action with amount and deadline>"
  ]
}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    const rawText = response.choices[0].message.content;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const result = JSON.parse(jsonMatch[0]);
    res.json({ success: true, result });

  } catch (error) {
    console.error('Tax error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;