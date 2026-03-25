const express = require('express');
const Groq = require('groq-sdk');
const { analyzePrompt } = require('../prompts/prompts');
const router = express.Router();

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

router.post('/', async (req, res) => {
  try {
    const userData = req.body;
    console.log('Received:', userData);

    const prompt = analyzePrompt(userData);
    console.log('Calling Groq...');

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    console.log('Groq responded!');
    const rawText = response.choices[0].message.content;
    console.log('Raw:', rawText);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');

    const analysis = JSON.parse(jsonMatch[0]);
    res.json({ success: true, analysis });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;