import { useState } from 'react';
import './OnboardingForm.css';

const OnboardingForm = ({ onSubmit }) => {
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', age: '', income: '',
    expenses: '', savings: '',
    goal: 'retirement', risk: 'medium'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.age || 
        !formData.income || !formData.expenses) {
      setError('Please fill all fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="form-container">
      <div className="form-card">

        <div className="form-header">
          <h1>💰 FinSmart</h1>
          <p>Your free AI-powered financial advisor</p>
        </div>

        <div className="form-fields">

          <div className="field">
            <label>Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Priya Sharma"
            />
          </div>

          <div className="field">
            <label>Age</label>
            <input
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g. 24"
            />
          </div>

          <div className="field">
            <label>Monthly Income (₹)</label>
            <input
              name="income"
              type="number"
              value={formData.income}
              onChange={handleChange}
              placeholder="e.g. 50000"
            />
          </div>

          <div className="field">
            <label>Monthly Expenses (₹)</label>
            <input
              name="expenses"
              type="number"
              value={formData.expenses}
              onChange={handleChange}
              placeholder="e.g. 35000"
            />
          </div>

          <div className="field">
            <label>Current Savings (₹)</label>
            <input
              name="savings"
              type="number"
              value={formData.savings}
              onChange={handleChange}
              placeholder="e.g. 100000"
            />
          </div>

          <div className="field">
            <label>Main Financial Goal</label>
            <select name="goal" value={formData.goal} onChange={handleChange}>
              <option value="retirement">Retire Early (FIRE)</option>
              <option value="house">Buy a House</option>
              <option value="education">Child's Education</option>
              <option value="emergency">Build Emergency Fund</option>
              <option value="wealth">General Wealth Building</option>
            </select>
          </div>

          <div className="field">
            <label>Risk Appetite</label>
            <select name="risk" value={formData.risk} onChange={handleChange}>
              <option value="low">Low — I prefer safety</option>
              <option value="medium">Medium — Balanced approach</option>
              <option value="high">High — I want maximum growth</option>
            </select>
          </div>

        </div>

        {error && <p className="error">{error}</p>}

        <button
          className="submit-btn"
          onClick={handleSubmit}
        >
          ✨ Get My Financial Report
        </button>

        <p className="privacy-note">
          🔒 Your data is private and never stored
        </p>

      </div>
    </div>
  );
};

export default OnboardingForm;