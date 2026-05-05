const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Store file in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  }
});

router.post('/statement', upload.single('statement'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a PDF file'
      });
    }

    console.log('PDF received, parsing...');

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const rawText = pdfData.text;

    console.log('PDF parsed, sending to AI...');

    // Use AI to extract transactions
    const prompt = `
Extract all bank transactions from this bank statement text.
Find every debit and credit entry.

Bank statement text:
${rawText.substring(0, 8000)}

Return ONLY this JSON — no extra text:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "transaction description",
      "amount": <number>,
      "type": "DEBIT or CREDIT",
      "balance": <running balance if available, else 0>
    }
  ],
  "bankName": "<detected bank name>",
  "accountHolder": "<name if found>",
  "period": "<statement period if found>"
}

Rules:
- amount must be a positive number
- type must be exactly "DEBIT" or "CREDIT"
- date must be YYYY-MM-DD format
- If date format is unclear use today's date
- Include ALL transactions found
`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    const rawResponse = response.choices[0].message.content;
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(500).json({
        success: false,
        error: 'Could not parse transactions from PDF'
      });
    }

    const result = JSON.parse(jsonMatch[0]);

    console.log(`Extracted ${result.transactions?.length} transactions`);

    res.json({
      success: true,
      transactions: result.transactions || [],
      bankName: result.bankName,
      accountHolder: result.accountHolder,
      period: result.period
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process PDF. Please try a different statement.'
    });
  }
});

module.exports = router;