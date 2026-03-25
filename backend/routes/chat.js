const express = require('express');
const Groq = require('groq-sdk');
const { chatPrompt } = require('../prompts/prompts');
const router = express.Router();

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

router.post('/', async (req, res) => {
  try {
    const { userProfile, message } = req.body;
    const prompt = chatPrompt(userProfile, message);

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    });

    const reply = response.choices[0].message.content;
    res.json({ success: true, reply });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;