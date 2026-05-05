import { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import API from '../config';

const Register = ({ onLogin, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async () => {
  if (!formData.name || !formData.email || !formData.password) {
    setError('Please fill all fields');
    return;
  }
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return;
  }
  if (formData.password.length < 6) {
    setError('Password must be at least 6 characters');
    return;
  }
  setLoading(true);
  setError('');
  try {
    const res = await axios.post(`${API}/api/auth/login`, formData,
      {
        name: formData.name,
        email: formData.email,
        password: formData.password
      }
    );
    // Pass both user AND token to App
    onLogin(res.data.user, res.data.token);
  } catch (err) {
    setError(err.response?.data?.error || 'Registration failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>💰 FinSmart</h1>
          <p>Create your free account</p>
        </div>

        <div className="auth-fields">
          <div className="auth-field">
            <label>Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Priya Sharma"
            />
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="priya@example.com"
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
            />
          </div>
          <div className="auth-field">
            <label>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
            />
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button
          className="auth-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '⏳ Creating account...' : '✨ Create Account'}
        </button>

        <p className="auth-switch">
          Already have an account?{' '}
          <span onClick={onSwitchToLogin}>Login here</span>
        </p>

        <p className="auth-note">
          🔒 Your data is encrypted and never shared
        </p>
      </div>
    </div>
  );
};

export default Register;