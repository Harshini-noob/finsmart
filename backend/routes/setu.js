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
  // Make it feel like a real person's account
const demoTransactions = [
  { date:'2026-03-01', amount:62000, type:'CREDIT', description:'SALARY - INFOSYS LTD' },
  { date:'2026-03-02', amount:15000, type:'DEBIT',  description:'HDFC BANK - RENT TRANSFER' },
  { date:'2026-03-03', amount:849,   type:'DEBIT',  description:'SWIGGY ORDER #445521' },
  { date:'2026-03-04', amount:1299,  type:'DEBIT',  description:'NETFLIX SUBSCRIPTION' },
  { date:'2026-03-05', amount:2340,  type:'DEBIT',  description:'UBER RIDES' },
  { date:'2026-03-07', amount:5000,  type:'DEBIT',  description:'SBI MUTUAL FUND SIP' },
  { date:'2026-03-08', amount:3240,  type:'DEBIT',  description:'AMAZON SHOPPING' },
  { date:'2026-03-10', amount:1200,  type:'DEBIT',  description:'BPCL PETROL PUMP' },
  { date:'2026-03-12', amount:890,   type:'DEBIT',  description:'ZOMATO ORDER #332211' },
  { date:'2026-03-14', amount:25000, type:'DEBIT',  description:'HDFC CREDIT CARD BILL' },
  { date:'2026-03-15', amount:4500,  type:'DEBIT',  description:'BIGBASKET GROCERIES' },
  { date:'2026-03-17', amount:750,   type:'DEBIT',  description:'BESCOM ELECTRICITY BILL' },
  { date:'2026-03-18', amount:1800,  type:'DEBIT',  description:'APOLLO PHARMACY' },
  { date:'2026-03-20', amount:3500,  type:'DEBIT',  description:'MYNTRA CLOTHING' },
  { date:'2026-03-22', amount:500,   type:'DEBIT',  description:'PVR CINEMAS' },
  { date:'2026-03-24', amount:2000,  type:'DEBIT',  description:'AIRTEL BROADBAND' },
  { date:'2026-03-25', amount:1500,  type:'CREDIT', description:'FREELANCE PAYMENT - UPWORK' },
  { date:'2026-03-27', amount:800,   type:'DEBIT',  description:'CULT FIT MEMBERSHIP' },
  { date:'2026-03-28', amount:12000, type:'DEBIT',  description:'LIC PREMIUM PAYMENT' },
  { date:'2026-03-30', amount:5000,  type:'DEBIT',  description:'PPF CONTRIBUTION' },
];

  res.json({ success: true, transactions: demoTransactions });
});

module.exports = router;