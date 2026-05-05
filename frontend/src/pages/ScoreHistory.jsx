import { useState, useEffect } from 'react';
import axios from 'axios';
import './ScoreHistory.css';
import API from '../config';


const ScoreHistory = ({ token, onBack }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

// eslint-disable-next-line
useEffect(() => {
  fetchHistory();
}, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/api/scores/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScores(res.data.scores);
    } catch (err) {
      console.error('Fetch history error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#2563eb';
    if (score >= 40) return '#d97706';
    return '#dc2626';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const maxScore = Math.max(...scores.map(s => s.score), 100);

  const getDiff = (current, previous) => {
    if (!previous) return null;
    return current - previous;
  };

  return (
    <div className="history-container">
      <div className="history-inner">

        {/* Header */}
        <div className="history-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h1>📈 Score History</h1>
          <p>Track your financial health over time</p>
        </div>

        {loading ? (
          <div className="history-loading">
            Loading your history...
          </div>
        ) : scores.length === 0 ? (
          <div className="no-history">
            <p style={{ fontSize: '48px' }}>📊</p>
            <h2>No history yet!</h2>
            <p>Complete your first analysis to start tracking</p>
          </div>
        ) : (
          <>
            {/* Latest Score */}
            <div
              className="latest-score-card"
              style={{
                background: getScoreColor(scores[scores.length - 1]?.score),
              }}
            >
              <p className="latest-label">Current Score</p>
              <p className="latest-number">
                {scores[scores.length - 1]?.score}
              </p>
              <p className="latest-tag">
                {getScoreLabel(scores[scores.length - 1]?.score)}
              </p>
              {scores.length > 1 && (
                <p className="latest-change">
                  {getDiff(
                    scores[scores.length - 1]?.score,
                    scores[scores.length - 2]?.score
                  ) > 0
                    ? `▲ +${getDiff(scores[scores.length-1]?.score, scores[scores.length-2]?.score)} from last month`
                    : getDiff(
                        scores[scores.length - 1]?.score,
                        scores[scores.length - 2]?.score
                      ) < 0
                    ? `▼ ${getDiff(scores[scores.length-1]?.score, scores[scores.length-2]?.score)} from last month`
                    : '→ No change from last month'
                  }
                </p>
              )}
            </div>

            {/* Bar Chart */}
            <div className="history-chart-card">
              <h2>📊 Monthly Progress</h2>
              <div className="bar-chart">
                {scores.map((s, i) => (
                  <div className="bar-col" key={i}>
                    <p
                      className="bar-score"
                      style={{ color: getScoreColor(s.score) }}
                    >
                      {s.score}
                    </p>
                    <div className="bar-wrap">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${(s.score / maxScore) * 100}%`,
                          background: getScoreColor(s.score)
                        }}
                      />
                    </div>
                    <p className="bar-month">{s.month}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Score List */}
            <div className="history-list-card">
              <h2>📋 Detailed History</h2>
              <div className="history-list">
                {[...scores].reverse().map((s, i, arr) => {
                  const prev = arr[i + 1];
                  const diff = prev
                    ? s.score - prev.score
                    : null;

                  return (
                    <div className="history-row" key={i}>
                      <div className="history-month-info">
                        <span className="history-month">{s.month}</span>
                        <span
                          className="history-label"
                          style={{ color: getScoreColor(s.score) }}
                        >
                          {getScoreLabel(s.score)}
                        </span>
                      </div>

                      <div className="history-bar-row">
                        <div className="history-bar-bg">
                          <div
                            className="history-bar-fill"
                            style={{
                              width: `${s.score}%`,
                              background: getScoreColor(s.score)
                            }}
                          />
                        </div>
                        <span
                          className="history-score"
                          style={{ color: getScoreColor(s.score) }}
                        >
                          {s.score}
                        </span>
                      </div>

                      {diff !== null && (
                        <div className={`history-diff ${diff >= 0 ? 'up' : 'down'}`}>
                          {diff >= 0 ? '▲' : '▼'} {Math.abs(diff)}
                        </div>
                      )}

                      <div className="history-finances">
                        <span>
                          💰 ₹{Number(s.income).toLocaleString('en-IN')}/mo
                        </span>
                        <span>
                          💸 ₹{Number(s.expenses).toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tips based on trend */}
            <div className="trend-card">
              <h2>💡 What Your Trend Says</h2>
              {scores.length >= 2 ? (
                scores[scores.length - 1].score >
                scores[scores.length - 2].score ? (
                  <p className="trend-positive">
                    🎉 Your score is improving! Keep up the great work.
                    Consistency is the key to financial freedom.
                  </p>
                ): scores[scores.length - 1].score <
                   scores[scores.length - 2].score ? (
                  <p className="trend-negative">
                    ⚠️ Your score dropped this month. Review your
                    spending and check if you missed any investments.
                  </p>
                ) : (
                  <p className="trend-neutral">
                    → Your score is stable. Try to push it higher
                    by starting a new SIP or cutting one expense.
                  </p>
                )
              ) : (
                <p className="trend-neutral">
                  Come back next month after your next analysis
                  to see your trend!
                </p>
              )}
            </div>

          </>
        )}

      </div>
    </div>
  );
};

export default ScoreHistory;