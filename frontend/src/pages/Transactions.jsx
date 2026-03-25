import { useState, useEffect } from 'react';
import axios from 'axios';
import './Transactions.css';

const Transactions = ({ onTransactionsLoaded }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState('connect');

  const categories = {
    food: ['zomato', 'swiggy', 'restaurant', 'food', 'cafe'],
    transport: ['uber', 'ola', 'petrol', 'metro', 'cab'],
    shopping: ['amazon', 'flipkart', 'clothes', 'shopping'],
    entertainment: ['netflix', 'hotstar', 'movie', 'pvr'],
    bills: ['electricity', 'internet', 'bill', 'rent'],
    health: ['medical', 'pharmacy', 'hospital', 'doctor'],
    investment: ['mutual fund', 'sip', 'ppf', 'nps'],
    salary: ['salary', 'credited'],
  };

  const getCategory = (description) => {
    const desc = description.toLowerCase();
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(k => desc.includes(k))) return cat;
    }
    return 'other';
  };

  const getCategoryEmoji = (cat) => {
    const emojis = {
      food: '🍔', transport: '🚗', shopping: '🛍️',
      entertainment: '🎬', bills: '💡', health: '💊',
      investment: '📈', salary: '💰', other: '💸'
    };
    return emojis[cat] || '💸';
  };

  const loadDemoTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        'http://localhost:5000/api/setu/demo-transactions'
      );
      const txns = res.data.transactions.map(t => ({
        ...t,
        category: getCategory(t.description)
      }));
      setTransactions(txns);
      setStep('loaded');

      // Calculate summary for AI
      const summary = buildSummary(txns);
      onTransactionsLoaded(txns, summary);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buildSummary = (txns) => {
    const debits = txns.filter(t => t.type === 'DEBIT');
    const totalSpent = debits.reduce((s, t) => s + t.amount, 0);

    const byCategory = {};
    debits.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cat, amt]) => `${cat}: Rs.${amt}`)
      .join(', ');

    return `Total spent: Rs.${totalSpent}. 
            Top spending: ${topCategories}`;
  };

  // Spending by category for summary
  const spendingByCategory = transactions
    .filter(t => t.type === 'DEBIT')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  return (
    <div className="txn-container">

      {step === 'connect' && (
        <div className="connect-card">
          <h2>🏦 Connect Your Bank</h2>
          <p>Get personalized advice based on your real spending</p>

          <div className="connect-options">
            {/* Demo option for hackathon */}
            <button
              className="demo-btn"
              onClick={loadDemoTransactions}
              disabled={loading}
            >
              {loading ? '⏳ Loading...' : '🎯 Use Demo Bank Data'}
            </button>

            <p className="divider">— or connect real bank —</p>

            <input
              placeholder="Enter mobile number"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              className="mobile-input"
            />
            <button
              className="connect-btn"
              onClick={loadDemoTransactions}
            >
              🏦 Connect via Account Aggregator
            </button>
          </div>

          <p className="security-note">
            🔒 RBI approved. We never see your password.
          </p>
        </div>
      )}

      {step === 'loaded' && (
        <div className="txn-loaded">

          {/* Spending Summary */}
          <div className="spend-summary">
            <h3>📊 Last 30 Days Spending</h3>
            <div className="category-grid">
              {Object.entries(spendingByCategory).map(([cat, amt]) => (
                <div className="cat-card" key={cat}>
                  <span className="cat-emoji">
                    {getCategoryEmoji(cat)}
                  </span>
                  <span className="cat-name">{cat}</span>
                  <span className="cat-amount">₹{amt.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction List */}
          <div className="txn-list">
            <h3>📋 Recent Transactions</h3>
            {transactions.map((txn, i) => (
              <div className="txn-row" key={i}>
                <span className="txn-emoji">
                  {getCategoryEmoji(txn.category)}
                </span>
                <div className="txn-info">
                  <span className="txn-desc">{txn.description}</span>
                  <span className="txn-date">{txn.date}</span>
                </div>
                <span className={`txn-amount ${txn.type === 'CREDIT' ? 'credit' : 'debit'}`}>
                  {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};

export default Transactions;