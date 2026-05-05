import { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import API from '../config';


const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async () => {
  if (!formData.email || !formData.password) {
    setError('Please fill all fields');
    return;
  }
  setLoading(true);
  setError('');
  try {
    const res =await axios.post(`${API}/api/auth/login`, formData);
    // Pass both user AND token to App
    onLogin(res.data.user, res.data.token);
  } catch (err) {
    setError(err.response?.data?.error || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>💰 FinSmart</h1>
          <p>Welcome back! Login to your account</p>
        </div>

        <div className="auth-fields">
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
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button
          className="auth-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '⏳ Logging in...' : '🔐 Login'}
        </button>

        <p className="auth-switch">
          Don't have an account?{' '}
          <span onClick={onSwitchToRegister}>Register here</span>
        </p>
      </div>
    </div>
  );
};

export default Login;