import { useState } from 'react';
import axios from 'axios';
import './TaxWizard.css';

const TaxWizard = ({ userData, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    basic: '',
    hra: '',
    special: '',
    other: '',
    existing80c: '',
    hasHealthInsurance: 'no',
    hasNPS: 'no',
    homeLoan: 'no'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnalyze = async () => {
    if (!formData.basic) {
      alert('Please enter at least your basic salary');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/tax',
        { ...formData, ...userData }
      );
      setResult(response.data.result);
    } catch (err) {
      alert('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tax-container">
      <div className="tax-inner">

        {/* Header */}
        <div className="tax-header">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <h1>💸 Tax Wizard</h1>
          <p>Find every rupee you can save on tax</p>
        </div>

        {!result ? (
          <div className="tax-form-card">
            <h2>Enter Your Salary Structure</h2>
            <p className="tax-note">
              Find this on your salary slip or Form 16
            </p>

            <div className="tax-fields">
              <div className="tax-field">
                <label>Basic Salary (monthly ₹)</label>
                <input
                  name="basic"
                  type="number"
                  value={formData.basic}
                  onChange={handleChange}
                  placeholder="e.g. 30000"
                />
              </div>

              <div className="tax-field">
                <label>HRA — House Rent Allowance (₹)</label>
                <input
                  name="hra"
                  type="number"
                  value={formData.hra}
                  onChange={handleChange}
                  placeholder="e.g. 10000"
                />
              </div>

              <div className="tax-field">
                <label>Special Allowance (₹)</label>
                <input
                  name="special"
                  type="number"
                  value={formData.special}
                  onChange={handleChange}
                  placeholder="e.g. 10000"
                />
              </div>

              <div className="tax-field">
                <label>Other Allowances (₹)</label>
                <input
                  name="other"
                  type="number"
                  value={formData.other}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                />
              </div>

              <div className="tax-field">
                <label>Already investing under 80C (₹/year)</label>
                <input
                  name="existing80c"
                  type="number"
                  value={formData.existing80c}
                  onChange={handleChange}
                  placeholder="e.g. 50000 (PF, LIC etc)"
                />
              </div>

              <div className="tax-field">
                <label>Do you have Health Insurance?</label>
                <select
                  name="hasHealthInsurance"
                  value={formData.hasHealthInsurance}
                  onChange={handleChange}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div className="tax-field">
                <label>Do you invest in NPS?</label>
                <select
                  name="hasNPS"
                  value={formData.hasNPS}
                  onChange={handleChange}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div className="tax-field">
                <label>Do you have a Home Loan?</label>
                <select
                  name="homeLoan"
                  value={formData.homeLoan}
                  onChange={handleChange}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>

            <button
              className="tax-analyze-btn"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? '⏳ Calculating...' : '🔍 Find My Tax Savings'}
            </button>
          </div>

        ) : (

          <div className="tax-result">

            {/* Total Savings */}
            <div className="tax-saving-hero">
              <p className="tax-saving-label">
                Total Tax You Can Save
              </p>
              <p className="tax-saving-amount">
                ₹{result.totalSavings.toLocaleString('en-IN')}
              </p>
              <p className="tax-saving-sub">per year</p>
            </div>

            {/* Old vs New Regime */}
            <div className="card regime-card">
              <h2>📊 Old vs New Tax Regime</h2>
              <div className="regime-compare">
                <div className={`regime-box ${result.betterRegime === 'old' ? 'winner' : ''}`}>
                  <p className="regime-label">Old Regime</p>
                  <p className="regime-tax">
                    ₹{result.oldRegimeTax.toLocaleString('en-IN')}
                  </p>
                  {result.betterRegime === 'old' && (
                    <span className="winner-badge">✅ Better for you</span>
                  )}
                </div>
                <div className={`regime-box ${result.betterRegime === 'new' ? 'winner' : ''}`}>
                  <p className="regime-label">New Regime</p>
                  <p className="regime-tax">
                    ₹{result.newRegimeTax.toLocaleString('en-IN')}
                  </p>
                  {result.betterRegime === 'new' && (
                    <span className="winner-badge">✅ Better for you</span>
                  )}
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="card">
              <h2>💡 Deductions You Can Claim</h2>
              {result.deductions.map((d, i) => (
                <div className="deduction-row" key={i}>
                  <div className="deduction-info">
                    <span className="deduction-name">{d.name}</span>
                    <span className="deduction-section">{d.section}</span>
                    <span className="deduction-desc">{d.description}</span>
                  </div>
                  <div className="deduction-amounts">
                    <span className="deduction-invest">
                      Invest ₹{d.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="deduction-save">
                      Save ₹{d.taxSaved.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Steps */}
            <div className="card purple">
              <h2>🎯 Do These This Month</h2>
              <ol>
                {result.actionSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            <button
              className="tax-back-btn"
              onClick={() => setResult(null)}
            >
              ← Recalculate
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

export default TaxWizard;