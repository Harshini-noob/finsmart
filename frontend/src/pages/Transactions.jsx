import { useState } from 'react';
import axios from 'axios';
import './Transactions.css';
import API from '../config';

const Transactions = ({ onTransactionsLoaded }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('connect');
  const [summary, setSummary] = useState('');
  const [bankInfo, setBankInfo] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const categories = {
    food:          ['zomato', 'swiggy', 'restaurant', 'food',
                    'cafe', 'bigbasket', 'grocery', 'blinkit'],
    transport:     ['uber', 'ola', 'petrol', 'metro', 'cab',
                    'bpcl', 'rides', 'rapido', 'irctc'],
    shopping:      ['amazon', 'flipkart', 'clothes', 'shopping',
                    'myntra', 'nykaa', 'meesho'],
    entertainment: ['netflix', 'hotstar', 'movie', 'pvr',
                    'spotify', 'prime', 'youtube'],
    bills:         ['electricity', 'internet', 'bill', 'rent',
                    'airtel', 'bescom', 'broadband', 'jio', 'bsnl'],
    health:        ['medical', 'pharmacy', 'hospital', 'doctor',
                    'apollo', 'cult', 'healthifyme'],
    investment:    ['mutual fund', 'sip', 'ppf', 'nps', 'lic',
                    'groww', 'zerodha', 'kuvera'],
    salary:        ['salary', 'credited', 'neft', 'rtgs',
                    'freelance', 'payment received'],
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

  const getCategoryColor = (cat) => {
    const colors = {
      food: '#ef4444', transport: '#f97316',
      shopping: '#8b5cf6', entertainment: '#06b6d4',
      bills: '#64748b', health: '#16a34a',
      investment: '#2563eb', salary: '#16a34a', other: '#94a3b8'
    };
    return colors[cat] || '#94a3b8';
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
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: Rs.${amt}`)
      .join(', ');
    return `Total spent: Rs.${totalSpent}. 
            Breakdown: ${topCategories}`;
  };

  const processTransactions = (txns) => {
    return txns.map(t => ({
      ...t,
      category: getCategory(t.description)
    }));
  };

  // Load demo data
  const loadDemoTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/setu/demo-transactions`);
      const txns = processTransactions(res.data.transactions);
      const sum = buildSummary(txns);
      setTransactions(txns);
      setSummary(sum);
      setBankInfo({ bankName: 'Demo Bank', period: 'Last 30 days' });
      setStep('loaded');
    } catch (err) {
      alert('Failed to load demo data');
    } finally {
      setLoading(false);
    }
  };

  // Upload PDF statement
  const handlePdfUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('statement', file);

      const res = await axios.post(
        `${API}/api/upload/statement`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (!res.data.success) {
        throw new Error(res.data.error);
      }

      const txns = processTransactions(res.data.transactions);
      const sum = buildSummary(txns);
      setTransactions(txns);
      setSummary(sum);
      setBankInfo({
        bankName: res.data.bankName || 'Your Bank',
        accountHolder: res.data.accountHolder,
        period: res.data.period
      });
      setStep('loaded');

    } catch (err) {
      alert(err.message || 'Failed to process PDF. Try demo data.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handlePdfUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePdfUpload(file);
  };

  // Spending calculations
  const spendingByCategory = transactions
    .filter(t => t.type === 'DEBIT')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const totalSpent = transactions
    .filter(t => t.type === 'DEBIT')
    .reduce((s, t) => s + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'CREDIT')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="txn-container">

      {/* CONNECT STEP */}
      {step === 'connect' && (
        <div className="connect-card">
          <div className="connect-icon">🏦</div>
          <h2>Connect Your Bank</h2>
          <p>Get AI advice based on your real spending</p>

          {/* PDF Upload — Primary Option */}
          <div className="upload-section">
            <h3>📄 Upload Bank Statement</h3>
            <p className="upload-desc">
              Download your statement PDF from your bank app
              and upload it here. Works with all Indian banks.
            </p>

            <div
              className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('pdf-input').click()}
            >
              {loading ? (
                <div className="upload-loading">
                  <p style={{ fontSize: '32px' }}>🤖</p>
                  <p>Reading your statement...</p>
                  <p className="upload-sub">
                    AI is extracting transactions
                  </p>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '40px' }}>📄</p>
                  <p className="drop-text">
                    Drop your PDF here or click to browse
                  </p>
                  <p className="drop-sub">
                    SBI · HDFC · ICICI · Axis · Kotak · Any bank
                  </p>
                </>
              )}
            </div>

            <input
              id="pdf-input"
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />

            <div className="bank-steps">
              <p className="steps-title">
                How to download your statement:
              </p>
              <div className="steps-list">
                <div className="bank-step">
                  <span className="step-num">1</span>
                  <span>Open your bank app or net banking</span>
                </div>
                <div className="bank-step">
                  <span className="step-num">2</span>
                  <span>Go to Statements → Last 3 months</span>
                </div>
                <div className="bank-step">
                  <span className="step-num">3</span>
                  <span>Download as PDF</span>
                </div>
                <div className="bank-step">
                  <span className="step-num">4</span>
                  <span>Upload here ↑</span>
                </div>
              </div>
            </div>

            <p className="privacy-note">
              🔒 Your statement is processed securely.
              We never store your PDF.
            </p>
          </div>

          <div className="or-divider">— or —</div>

          {/* Demo Option */}
          <button
            className="demo-btn"
            onClick={loadDemoTransactions}
            disabled={loading}
          >
            🎯 Use Demo Bank Data
          </button>
          <p className="demo-note">
            Try with realistic sample transactions
          </p>
        </div>
      )}

      {/* LOADED STEP */}
      {step === 'loaded' && (
        <div className="txn-loaded">

          {/* Bank Info */}
          {bankInfo && (
            <div className="bank-info-bar">
              <span>🏦 {bankInfo.bankName}</span>
              {bankInfo.accountHolder && (
                <span>👤 {bankInfo.accountHolder}</span>
              )}
              {bankInfo.period && (
                <span>📅 {bankInfo.period}</span>
              )}
            </div>
          )}

          {/* Income vs Spending */}
          <div className="money-summary">
            <div className="money-box income">
              <p className="money-label">💰 Income</p>
              <p className="money-amount">
                ₹{totalIncome.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="money-box spent">
              <p className="money-label">💸 Spent</p>
              <p className="money-amount">
                ₹{totalSpent.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="money-box saved">
              <p className="money-label">🏦 Saved</p>
              <p className="money-amount">
                ₹{(totalIncome - totalSpent).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Spending Categories */}
          <div className="category-section">
            <h3>📊 Where Your Money Goes</h3>
            <div className="category-grid">
              {Object.entries(spendingByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => (
                <div className="cat-card" key={cat}>
                  <div className="cat-top">
                    <span className="cat-emoji">
                      {getCategoryEmoji(cat)}
                    </span>
                    <span
                      className="cat-pct"
                      style={{ color: getCategoryColor(cat) }}
                    >
                      {Math.round((amt / totalSpent) * 100)}%
                    </span>
                  </div>
                  <p className="cat-name">{cat}</p>
                  <p
                    className="cat-amount"
                    style={{ color: getCategoryColor(cat) }}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </p>
                  <div className="cat-bar-bg">
                    <div
                      className="cat-bar-fill"
                      style={{
                        width: `${Math.round((amt/totalSpent)*100)}%`,
                        background: getCategoryColor(cat)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction List */}
          <div className="txn-list-section">
            <h3>
              📋 Transactions
              <span className="txn-count">
                {transactions.length} found
              </span>
            </h3>
            <div className="txn-list">
              {transactions.slice(0, 20).map((txn, i) => (
                <div className="txn-row" key={i}>
                  <div
                    className="txn-icon"
                    style={{
                      background: getCategoryColor(txn.category) + '20'
                    }}
                  >
                    {getCategoryEmoji(txn.category)}
                  </div>
                  <div className="txn-info">
                    <span className="txn-desc">{txn.description}</span>
                    <span
                      className="txn-cat"
                      style={{ color: getCategoryColor(txn.category) }}
                    >
                      {txn.category}
                    </span>
                  </div>
                  <div className="txn-right">
                    <span className={`txn-amount
                      ${txn.type === 'CREDIT' ? 'credit' : 'debit'}`}>
                      {txn.type === 'CREDIT' ? '+' : '-'}
                      ₹{txn.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="txn-date">{txn.date}</span>
                  </div>
                </div>
              ))}
              {transactions.length > 20 && (
                <p className="more-txns">
                  + {transactions.length - 20} more transactions analyzed
                </p>
              )}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            className="analyze-btn"
            onClick={() => onTransactionsLoaded(transactions, summary)}
          >
            🤖 Analyze My Finances with AI →
          </button>
          <p className="analyze-note">
            AI will analyze your spending and give
            personalized advice
          </p>

        </div>
      )}
    </div>
  );
};

export default Transactions;