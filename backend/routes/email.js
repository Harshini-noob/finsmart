const express = require('express');
const nodemailer = require('nodemailer');
const protect = require('../middleware/auth');
const Score = require('../models/Score');
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/send-report', protect, async (req, res) => {
  try {
    const { analysis, userData } = req.body;
    const userEmail = req.user.email;
    const userName = req.user.name;

    const scoreColor =
      analysis.score >= 80 ? '#16a34a' :
      analysis.score >= 60 ? '#2563eb' :
      analysis.score >= 40 ? '#d97706' : '#dc2626';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f0f2f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .header p { color: #BDD7FF; margin: 8px 0 0; }
    .score-section { padding: 32px; text-align: center; border-bottom: 1px solid #f1f5f9; }
    .score-number { font-size: 72px; font-weight: 900; color: ${scoreColor}; line-height: 1; }
    .score-label { font-size: 22px; font-weight: 700; color: ${scoreColor}; }
    .score-reason { color: #64748b; margin-top: 8px; font-size: 14px; }
    .section { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; }
    .section h2 { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 16px; }
    .item { padding: 8px 0; font-size: 14px; color: #374151; border-bottom: 1px solid #f8fafc; }
    .item:last-child { border-bottom: none; }
    .green { color: #16a34a; }
    .orange { color: #ea580c; }
    .action-item { padding: 10px 0; font-size: 14px; color: #374151; }
    .num { display: inline-block; background: #4f46e5; color: white; border-radius: 50%; width: 22px; height: 22px; text-align: center; line-height: 22px; font-size: 12px; font-weight: 700; margin-right: 8px; }
    .sip-box { background: #eef2ff; border-radius: 12px; padding: 16px; text-align: center; }
    .sip-amount { font-size: 28px; font-weight: 800; color: #4f46e5; }
    .footer { padding: 24px 32px; text-align: center; background: #0D3B8C; }
    .footer p { color: #93C5FD; font-size: 13px; margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 FinSmart</h1>
      <p>Your Monthly Financial Health Report</p>
    </div>

    <div class="score-section">
      <p style="color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:1px">
        Money Health Score
      </p>
      <div class="score-number">${analysis.score}</div>
      <div class="score-label">${analysis.scoreLabel}</div>
      <p class="score-reason">${analysis.scoreReason}</p>
    </div>

    <div class="section">
      <p style="color:#475569;font-size:14px;line-height:1.6">
        ${analysis.summary}
      </p>
    </div>

    <div class="section">
      <h2>✅ Your Strengths</h2>
      ${analysis.strengths.map(s =>
        `<div class="item green">• ${s}</div>`
      ).join('')}
    </div>

    <div class="section">
      <h2>⚠️ Areas to Improve</h2>
      ${analysis.gaps.map(g =>
        `<div class="item orange">• ${g}</div>`
      ).join('')}
    </div>

    <div class="section">
      <h2>🎯 Action Plan</h2>
      ${analysis.actionPlan.map((a, i) =>
        `<div class="action-item"><span class="num">${i+1}</span>${a}</div>`
      ).join('')}
    </div>

    <div class="section">
      <h2>📈 SIP Recommendation</h2>
      <div class="sip-box">
        <div class="sip-amount">
          ₹${analysis.sipRecommendation.amount.toLocaleString('en-IN')}/month
        </div>
        <p style="color:#4f46e5;font-size:13px;margin:8px 0 0">
          ${analysis.sipRecommendation.fund}
        </p>
        <p style="color:#64748b;font-size:12px;margin:4px 0 0">
          ${analysis.sipRecommendation.reason}
        </p>
      </div>
    </div>

    <div class="section">
      <h2>💸 Tax Savings You're Missing</h2>
      ${analysis.taxSavings.map(t => `
        <div class="item" style="display:flex;justify-content:space-between">
          <span>${t.instrument}</span>
          <span style="color:#16a34a;font-weight:700">
            Save ₹${t.taxSaved.toLocaleString('en-IN')}
          </span>
        </div>
      `).join('')}
    </div>

    <div class="footer">
      <p>💰 FinSmart — AI Financial Advisor for India</p>
      <p>This report was generated for ${userName}</p>
      <p style="margin-top:8px;font-size:11px;opacity:0.7">
        Your data is private and never shared with third parties
      </p>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: `FinSmart 💰 <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Your Financial Health Report — Score: ${analysis.score}/100 ${analysis.scoreLabel}`,
      html
    });

    console.log('Email sent to:', userEmail);
    res.json({ success: true, message: 'Report sent to your email!' });

  } catch (error) {
    console.error('Email error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;