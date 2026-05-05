import { useState, useEffect } from 'react';
import axios from 'axios';
import './Goals.css';

import API from '../config';


const Goals = ({ token, onBack }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [updateAmount, setUpdateAmount] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    targetDate: '',
    category: 'other'
  });

  // eslint-disable-next-line
useEffect(() => {
  fetchGoals();
}, []);

  const fetchGoals = async () => {
    try {
      const res = await axios.get(`${API}/api/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(res.data.goals);
    } catch (err) {
      console.error('Fetch goals error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.targetAmount || !formData.targetDate) {
      alert('Please fill all fields');
      return;
    }
    try {
      const res = await axios.post(`${API}/api/goals`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals([res.data.goal, ...goals]);
      setShowForm(false);
      setFormData({
        title: '',
        targetAmount: '',
        targetDate: '',
        category: 'other'
      });
    } catch (err) {
      alert('Failed to create goal');
    }
  };

  const handleUpdateProgress = async (goalId) => {
    if (!updateAmount) return;
    try {
      const res = await axios.put(
        `${API}/api/goals/${goalId}`,
        { currentAmount: Number(updateAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGoals(goals.map(g =>
        g._id === goalId ? res.data.goal : g
      ));
      setUpdating(null);
      setUpdateAmount('');
    } catch (err) {
      alert('Failed to update goal');
    }
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await axios.delete(`${API}/api/goals/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(goals.filter(g => g._id !== goalId));
    } catch (err) {
      alert('Failed to delete goal');
    }
  };

  const getProgress = (goal) =>
    Math.min(Math.round(
      (goal.currentAmount / goal.targetAmount) * 100
    ), 100);

  const getMonthsLeft = (targetDate) => {
    const months = Math.ceil(
      (new Date(targetDate) - new Date()) /
      (1000 * 60 * 60 * 24 * 30)
    );
    return months > 0 ? months : 0;
  };

  const getProgressColor = (pct) => {
    if (pct >= 100) return '#16a34a';
    if (pct >= 60)  return '#2563eb';
    if (pct >= 30)  return '#d97706';
    return '#dc2626';
  };

  const getCategoryEmoji = (cat) => {
    const emojis = {
      house: '🏠', car: '🚗', education: '🎓',
      retirement: '👴', emergency: '🛡️',
      travel: '✈️', other: '🎯'
    };
    return emojis[cat] || '🎯';
  };

  const totalGoals     = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const totalTarget    = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved     = goals.reduce((s, g) => s + g.currentAmount, 0);

  return (
    <div className="goals-container">
      <div className="goals-inner">

        {/* Header */}
        <div className="goals-header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h1>🎯 My Financial Goals</h1>
          <p>Track your progress towards every dream</p>
        </div>

        {/* Summary Stats */}
        {goals.length > 0 && (
          <div className="goals-stats">
            <div className="gstat">
              <p className="gstat-num">{totalGoals}</p>
              <p className="gstat-label">Total Goals</p>
            </div>
            <div className="gstat green">
              <p className="gstat-num">{completedGoals}</p>
              <p className="gstat-label">Completed</p>
            </div>
            <div className="gstat blue">
              <p className="gstat-num">
                ₹{totalSaved.toLocaleString('en-IN')}
              </p>
              <p className="gstat-label">Total Saved</p>
            </div>
            <div className="gstat purple">
              <p className="gstat-num">
                ₹{totalTarget.toLocaleString('en-IN')}
              </p>
              <p className="gstat-label">Total Target</p>
            </div>
          </div>
        )}

        {/* Add Goal Button */}
        <button
          className="add-goal-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add New Goal'}
        </button>

        {/* Add Goal Form */}
        {showForm && (
          <div className="goal-form-card">
            <h2>Create New Goal</h2>
            <div className="goal-fields">
              <div className="goal-field">
                <label>Goal Title</label>
                <input
                  placeholder="e.g. Buy a House, Emergency Fund"
                  value={formData.title}
                  onChange={e => setFormData({
                    ...formData, title: e.target.value
                  })}
                />
              </div>
              <div className="goal-field">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({
                    ...formData, category: e.target.value
                  })}
                >
                  <option value="house">🏠 Buy a House</option>
                  <option value="car">🚗 Buy a Car</option>
                  <option value="education">🎓 Education</option>
                  <option value="retirement">👴 Retirement</option>
                  <option value="emergency">🛡️ Emergency Fund</option>
                  <option value="travel">✈️ Travel</option>
                  <option value="other">🎯 Other</option>
                </select>
              </div>
              <div className="goal-field">
                <label>Target Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 2000000"
                  value={formData.targetAmount}
                  onChange={e => setFormData({
                    ...formData, targetAmount: e.target.value
                  })}
                />
              </div>
              <div className="goal-field">
                <label>Target Date</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={e => setFormData({
                    ...formData, targetDate: e.target.value
                  })}
                />
              </div>
            </div>
            <button className="create-btn" onClick={handleCreate}>
              ✅ Create Goal
            </button>
          </div>
        )}

        {/* Auto Update Notice */}
        <div className="auto-notice">
          🤖 Goals are automatically updated when you
          analyze your bank transactions
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="goals-loading">
            Loading your goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="no-goals">
            <p style={{ fontSize: '48px' }}>🎯</p>
            <h2>No goals yet!</h2>
            <p>Add your first financial goal to start tracking</p>
          </div>
        ) : (
          <div className="goals-list">
            {goals.map(goal => {
              const progress = getProgress(goal);
              const monthsLeft = getMonthsLeft(goal.targetDate);
              const color = getProgressColor(progress);
              const remaining = goal.targetAmount - goal.currentAmount;

              return (
                <div
                  className={`goal-card ${goal.status === 'completed' ? 'completed' : ''}`}
                  key={goal._id}
                >
                  {/* Goal Header */}
                  <div className="goal-card-header">
                    <div className="goal-title-row">
                      <span className="goal-emoji">
                        {getCategoryEmoji(goal.category)}
                      </span>
                      <div>
                        <h3 className="goal-title">{goal.title}</h3>
                        <span className={`goal-status ${goal.status}`}>
                          {goal.status === 'completed'
                            ? '✅ Completed!'
                            : goal.status === 'paused'
                            ? '⏸️ Paused'
                            : '🟢 Active'}
                        </span>
                      </div>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(goal._id)}
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="goal-progress">
                    <div className="progress-numbers">
                      <span style={{ color, fontWeight: 700 }}>
                        ₹{goal.currentAmount.toLocaleString('en-IN')} saved
                      </span>
                      <span
                        className="progress-pct"
                        style={{ color, fontSize: '20px', fontWeight: 900 }}
                      >
                        {progress}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${progress}%`,
                          background: color
                        }}
                      />
                    </div>
                    <div className="progress-target">
                      <span>
                        Target: ₹{goal.targetAmount.toLocaleString('en-IN')}
                      </span>
                      <span>
                        {goal.status === 'completed'
                          ? '🎉 Goal reached!'
                          : `${monthsLeft} months left`}
                      </span>
                    </div>
                  </div>

                  {/* Remaining */}
                  {goal.status !== 'completed' && (
                    <div className="goal-remaining">
                      <div className="remaining-item">
                        <span className="remaining-label">Still needed</span>
                        <span className="remaining-value red">
                          ₹{remaining.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="remaining-divider" />
                      <div className="remaining-item">
                        <span className="remaining-label">Save per month</span>
                        <span className="remaining-value blue">
                          ₹{goal.monthlyTarget?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="remaining-divider" />
                      <div className="remaining-item">
                        <span className="remaining-label">Months left</span>
                        <span className="remaining-value">
                          {monthsLeft}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Update Progress */}
                  {goal.status !== 'completed' && (
                    updating === goal._id ? (
                      <div className="update-form">
                        <p className="update-label">
                          Enter total amount saved so far:
                        </p>
                        <input
                          type="number"
                          placeholder={`Current: ₹${goal.currentAmount}`}
                          value={updateAmount}
                          onChange={e => setUpdateAmount(e.target.value)}
                          className="update-input"
                        />
                        <div className="update-btns">
                          <button
                            className="save-btn"
                            onClick={() => handleUpdateProgress(goal._id)}
                          >
                            ✅ Update
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={() => {
                              setUpdating(null);
                              setUpdateAmount('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="update-progress-btn"
                        onClick={() => setUpdating(goal._id)}
                      >
                        📝 Update Progress Manually
                      </button>
                    )
                  )}

                  {/* Completed Banner */}
                  {goal.status === 'completed' && (
                    <div className="completed-banner">
                      🎉 Congratulations! You reached your goal!
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Goals;