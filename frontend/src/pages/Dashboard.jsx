import { useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import TaxWizard from './TaxWizard';
import Goals from './Goals';
import ScoreHistory from './ScoreHistory';
import API from '../config';

const Dashboard = ({ userData, analysis, user, token, onLogout, onRestart }) => {

  const [showTax, setShowTax] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      text: `Hi ${userData.name}! 👋 Your Money Health Score is ${analysis.score}/100. Ask me anything!`
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [simInput, setSimInput] = useState('');
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [language, setLanguage] = useState('english');

  // ── Show other pages ──
  if (showTax) return <TaxWizard userData={userData} onBack={() => setShowTax(false)} />;
  if (showGoals) return <Goals token={token} onBack={() => setShowGoals(false)} />;
  if (showHistory) return <ScoreHistory token={token} onBack={() => setShowHistory(false)} />;

  // ── Score colors ──
  const getScoreColor = (score) => {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#2563eb';
    if (score >= 40) return '#d97706';
    return '#dc2626';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return '#f0fdf4';
    if (score >= 60) return '#eff6ff';
    if (score >= 40) return '#fffbeb';
    return '#fef2f2';
  };

  const color = getScoreColor(analysis.score);
  const bg    = getScoreBg(analysis.score);


 

  // ── Chat ──
const sendMessage = async () => {
  if (!chatInput.trim()) return;
  const userMessage = chatInput;
  setChatInput('');
  setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
  setChatLoading(true);
  try {
    const response = await axios.post(`${API}/api/chat`, {
      userProfile: {
        ...userData,
        score: analysis.score,
        language  // ← this must be here
      },
      message: userMessage
    });
    setChatMessages(prev => [
      ...prev,
      { role: 'ai', text: response.data.reply }
    ]);
  } catch (err) {
    setChatMessages(prev => [
      ...prev,
      { role: 'ai', text: 'Sorry, something went wrong!' }
    ]);
  } finally {
    setChatLoading(false);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // ── Simulator ──
  const runSimulation = async () => {
    if (!simInput.trim()) return;
    setSimLoading(true);
    setSimResult(null);
    try {
      const response = await axios.post(`${API}/api/simulate`, {
        userProfile: { ...userData, score: analysis.score },
        scenario: simInput
      });
      setSimResult(response.data.result);
    } catch (err) {
      setSimResult({
        newScore: analysis.score,
        impact: 'Could not simulate. Try again.',
        actions: []
      });
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-inner">

        {/* ── HEADER ── */}
        <div className="dash-header">
          <h1>💰 FinSmart</h1>
          <p>Financial Report for <strong>{userData.name}</strong></p>

          {/* Language Toggle */}
          <div className="lang-toggle">
            {['english', 'hindi', 'tamil'].map(lang => (
              <button
                key={lang}
                className={`lang-btn ${language === lang ? 'active' : ''}`}
                onClick={() => setLanguage(lang)}
              >
                {lang === 'english' ? '🇬🇧 EN' :
                 lang === 'hindi'   ? '🇮🇳 HI' : '🇮🇳 TA'}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="dash-header-btns">
            <button className="tax-wizard-btn" onClick={() => setShowTax(true)}>
              💸 Tax Wizard
            </button>
            {user?.id && (
              <button className="goals-btn" onClick={() => setShowGoals(true)}>
                🎯 My Goals
              </button>
            )}
            {user?.id && (
              <button className="history-btn" onClick={() => setShowHistory(true)}>
                📈 Score History
              </button>
            )}
            
            <button className="restart-btn" onClick={onRestart}>
              🔄 New Analysis
            </button>
            {user?.id && (
              <button className="logout-btn" onClick={onLogout}>
                Logout
              </button>
            )}
          </div>
        </div>

        {/* ── SCORE ── */}
        <div className="score-card" style={{ background: bg, borderColor: color }}>
          <p className="score-label">Money Health Score</p>
          <p className="score-number" style={{ color }}>{analysis.score}</p>
          <p className="score-tag" style={{ color }}>{analysis.scoreLabel}</p>
          <p className="score-reason">{analysis.scoreReason}</p>
        </div>

        {/* ── SUMMARY ── */}
        <div className="card">
          <h2>📋 Summary</h2>
          <p>{analysis.summary}</p>
        </div>

        {/* ── STRENGTHS + GAPS ── */}
        <div className="two-col">
          <div className="card green">
            <h2>✅ Strengths</h2>
            <ul>
              {analysis.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="card orange">
            <h2>⚠️ Gaps</h2>
            <ul>
              {analysis.gaps.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── ACTION PLAN ── */}
        <div className="card purple">
          <h2>🎯 Action Plan</h2>
          <ol>
            {analysis.actionPlan.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ol>
        </div>

        {/* ── SIP ── */}
        <div className="card">
          <h2>📈 SIP Recommendation</h2>
          <p className="big-number">
            ₹{analysis.sipRecommendation.amount.toLocaleString('en-IN')}/month
          </p>
          <p className="sub-text">Fund: {analysis.sipRecommendation.fund}</p>
          <p className="sub-text">{analysis.sipRecommendation.reason}</p>
        </div>

        {/* ── TAX SAVINGS ── */}
        <div className="card">
          <h2>💸 Tax Savings You're Missing</h2>
          {analysis.taxSavings.map((tax, i) => (
            <div className="tax-row" key={i}>
              <span>{tax.instrument}</span>
              <div>
                <span className="muted">
                  Invest ₹{tax.amount.toLocaleString('en-IN')}
                </span>
                <span className="save-text">
                  Save ₹{tax.taxSaved.toLocaleString('en-IN')} tax
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── EMERGENCY FUND ── */}
        <div className="card">
          <h2>🛡️ Emergency Fund</h2>
          <div className="three-col">
            <div className="stat">
              <p className="stat-label">Required</p>
              <p className="stat-value">
                ₹{analysis.emergencyFund.required.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="stat">
              <p className="stat-label">You Have</p>
              <p className="stat-value blue">
                ₹{analysis.emergencyFund.current.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="stat">
              <p className="stat-label">Gap</p>
              <p className="stat-value red">
                ₹{analysis.emergencyFund.gap.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          {analysis.emergencyFund.gap > 0 && (
            <p className="gap-note">
              Close this gap in{' '}
              <strong>{analysis.emergencyFund.monthsToClose} months</strong>{' '}
              at your current savings rate
            </p>
          )}
        </div>

        {/* ── WHAT IF SIMULATOR ── */}
        <div className="card sim-card">
          <h2>🔮 What If Simulator</h2>
          <p className="sim-subtitle">Test financial decisions before making them</p>

          <div className="sim-scenarios">
            {[
              'I start a SIP of ₹5,000/month',
              'I take a home loan of ₹40 lakhs',
              'I get a ₹1 lakh bonus',
              'I lose my job for 3 months',
              'I increase SIP to ₹10,000/month',
            ].map((s, i) => (
              <button
                key={i}
                className="scenario-btn"
                onClick={() => setSimInput(`What if ${s}?`)}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="sim-input-row">
            <input
              className="sim-input"
              placeholder="What if I start investing ₹3,000/month?"
              value={simInput}
              onChange={e => setSimInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && runSimulation()}
            />
            <button
              className="sim-btn"
              onClick={runSimulation}
              disabled={simLoading}
            >
              {simLoading ? '⏳' : 'Simulate'}
            </button>
          </div>

          {simResult && (
            <div className="sim-result">
              <div className="sim-scores">
                <div className="sim-score-box">
                  <p className="sim-score-label">Current Score</p>
                  <p className="sim-score-num"
                     style={{ color: getScoreColor(analysis.score) }}>
                    {analysis.score}
                  </p>
                </div>
                <div className="sim-arrow">→</div>
                <div className="sim-score-box">
                  <p className="sim-score-label">New Score</p>
                  <p className="sim-score-num"
                     style={{ color: getScoreColor(simResult.newScore) }}>
                    {simResult.newScore}
                  </p>
                </div>
                <div className={`sim-diff ${simResult.newScore >= analysis.score ? 'positive' : 'negative'}`}>
                  {simResult.newScore >= analysis.score ? '▲' : '▼'}{' '}
                  {Math.abs(simResult.newScore - analysis.score)} points
                </div>
              </div>
              <p className="sim-impact">{simResult.impact}</p>
              {simResult.actions?.length > 0 && (
                <ul className="sim-actions">
                  {simResult.actions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* ── CHAT ── */}
        <div className="card chat-card">
          <h2>💬 Ask Your AI Financial Advisor</h2>
          <p className="chat-subtitle">
            Ask anything in plain English
            {language !== 'english' && ` · Replies in ${language}`}
          </p>

          <div className="chat-messages">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}
              >
                {msg.role === 'ai' && (
                  <span className="ai-label">🤖 FinSmart</span>
                )}
                <p>{msg.text}</p>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-bubble ai-bubble">
                <span className="ai-label">🤖 FinSmart</span>
                <p>Thinking... ⏳</p>
              </div>
            )}
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="e.g. Should I buy a house or keep renting?"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="chat-send"
              onClick={sendMessage}
              disabled={chatLoading}
            >
              Send
            </button>
          </div>

          <div className="quick-questions">
            <p className="quick-label">Quick questions:</p>
            <div className="quick-btns">
              {[
                'Should I start a SIP now?',
                'How do I save more tax?',
                'Is my emergency fund enough?',
                'Should I buy a house?'
              ].map((q, i) => (
                <button
                  key={i}
                  className="quick-btn"
                  onClick={() => setChatInput(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;