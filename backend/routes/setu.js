const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get access token from Setu
const getSetuToken = async () => {
  const response = await axios.post(
    `${process.env.SETU_BASE_URL}/api/login`,
    {
      clientID: process.env.SETU_CLIENT_ID,
      secret: process.env.SETU_SECRET
    }
  );
  return response.data.accessToken;
};

// Step 1 — Create a consent request
// User will be redirected to approve sharing their bank data
router.post('/create-consent', async (req, res) => {
  try {
    const token = await getSetuToken();
    const { mobile } = req.body;

    const consentBody = {
      consentDuration: { unit: 'MONTH', value: 1 },
      dataRange: {
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
      },
      vua: `${mobile}@setu-sandbox`,
      context: [{ key: 'accountType', value: 'SAVINGS' }]
    };

    const response = await axios.post(
      `${process.env.SETU_BASE_URL}/api/v2/consents`,
      consentBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      consentId: response.data.id,
      redirectUrl: response.data.url
    });

  } catch (error) {
    console.error('Setu consent error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Step 2 — Fetch transactions after user approves
router.get('/transactions/:consentId', async (req, res) => {
  try {
    const token = await getSetuToken();
    const { consentId } = req.params;

    // Create data session
    const sessionResponse = await axios.post(
      `${process.env.SETU_BASE_URL}/api/v2/sessions`,
      { consentId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const sessionId = sessionResponse.data.id;

    // Fetch actual data
    const dataResponse = await axios.get(
      `${process.env.SETU_BASE_URL}/api/v2/sessions/${sessionId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const accounts = dataResponse.data.accounts || [];
    const transactions = [];

    accounts.forEach(account => {
      const txns = account.data?.transactions || [];
      txns.forEach(txn => {
        transactions.push({
          date: txn.valueDate,
          amount: txn.amount,
          type: txn.type,
          description: txn.narration,
          balance: txn.currentBalance
        });
      });
    });

    res.json({ success: true, transactions });

  } catch (error) {
    console.error('Setu data error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Step 3 — Use dummy data for demo if Setu not available
router.get('/demo-transactions', async (req, res) => {
  const demoTransactions = [
    { date: '2026-03-01', amount: 50000, type: 'CREDIT', description: 'SALARY HDFC BANK' },
    { date: '2026-03-02', amount: 850,   type: 'DEBIT',  description: 'Zomato Order' },
    { date: '2026-03-03', amount: 1200,  type: 'DEBIT',  description: 'Uber Cab' },
    { date: '2026-03-04', amount: 3400,  type: 'DEBIT',  description: 'Amazon Shopping' },
    { date: '2026-03-05', amount: 8000,  type: 'DEBIT',  description: 'HDFC Credit Card Bill' },
    { date: '2026-03-06', amount: 2100,  type: 'DEBIT',  description: 'Swiggy Food' },
    { date: '2026-03-07', amount: 1500,  type: 'DEBIT',  description: 'Netflix Hotstar' },
    { date: '2026-03-08', amount: 5000,  type: 'DEBIT',  description: 'SBI Mutual Fund SIP' },
    { date: '2026-03-10', amount: 900,   type: 'DEBIT',  description: 'Petrol Bunk' },
    { date: '2026-03-12', amount: 12000, type: 'DEBIT',  description: 'House Rent' },
    { date: '2026-03-15', amount: 3200,  type: 'DEBIT',  description: 'Grocery BigBasket' },
    { date: '2026-03-18', amount: 600,   type: 'DEBIT',  description: 'Electricity Bill' },
    { date: '2026-03-20', amount: 2500,  type: 'DEBIT',  description: 'Clothes Shopping' },
    { date: '2026-03-22', amount: 1800,  type: 'DEBIT',  description: 'Medical Pharmacy' },
    { date: '2026-03-25', amount: 700,   type: 'DEBIT',  description: 'Movie PVR' },
  ];

  res.json({ success: true, transactions: demoTransactions });
});

module.exports = router;