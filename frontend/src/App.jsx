import { useState, useEffect } from 'react';
import axios from 'axios';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import OnboardingForm from './pages/OnboardingForm';
import Transactions from './pages/Transactions';
import Dashboard from './pages/Dashboard';


import API from './config';



function App() {
  const [step, setStep] = useState('landing');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // token in memory only
  const [userData, setUserData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
 

  // On refresh → always go to landing
  // No auto-login from storage
  useEffect(() => {
    setStep('landing');
    setUser(null);
    setToken(null);
  }, []);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken); // store in memory only
    setStep('form');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setUserData(null);
    setAnalysis(null);
    setStep('landing');
  };

  const handleFormSubmit = async (data) => {
    // Save profile to DB if logged in
    if (token) {
      try {
        await axios.put(`${API}/api/auth/profile`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Profile save error:', err.message);
      }
    }
    setUserData(data);
    setStep('transactions');
  };

 const handleTransactionsLoaded = async (txns, summary) => {
  setLoading(true);
  try {
    const response = await axios.post(
      `${API}/api/analyze`,
      {
        ...userData,
        transactions: summary,
        language: 'english' // default on first analysis
      }
    );
    const result = response.data.analysis;
    setAnalysis(result);

    // Save score to DB if logged in
    if (token) {
      try {
        await axios.post(`${API}/api/scores`, {
          score: result.score,
          scoreLabel: result.scoreLabel,
          income: userData.income,
          expenses: userData.expenses,
          savings: userData.savings,
          analysis: result
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Score saved to DB ✅');
      } catch (err) {
        console.error('Score save error:', err.message);
      }

      // Auto update goals from transactions
      try {
        const goalRes = await axios.post(
          `${API}/api/goals/auto-update`,
          { transactions: txns },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(
          `Goals auto-updated ✅ 
           ${goalRes.data.updated} transactions matched`
        );
      } catch (err) {
        console.error('Goal auto-update error:', err.message);
      }
    }

    setStep('dashboard');
  } catch (err) {
    console.error('Analysis failed:', err);
    alert('Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      {step === 'landing' && (
        <Landing
          onStart={() => setStep('register')}
          onLogin={() => setStep('login')}
        />
      )}

      {step === 'login' && (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setStep('register')}
        />
      )}

      {step === 'register' && (
        <Register
          onLogin={handleLogin}
          onSwitchToLogin={() => setStep('login')}
        />
      )}

      {step === 'form' && (
        <OnboardingForm
          onSubmit={handleFormSubmit}
          user={user}
          onLogout={handleLogout}
        />
      )}

      {step === 'transactions' && (
        <div style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{
              color: '#4f46e5',
              fontSize: '26px',
              fontWeight: '800'
            }}>
              💰 FinSmart
            </h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>
              Step 2 of 2 — Connect your bank
            </p>
          </div>

          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <p style={{ fontSize: '48px' }}>🤖</p>
              <p style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#4f46e5',
                marginTop: '16px'
              }}>
                Analyzing your finances...
              </p>
              <p style={{ color: '#64748b', marginTop: '8px' }}>
                AI is reviewing your transactions
              </p>
              <div className="loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          ) : (
            <Transactions
              onTransactionsLoaded={handleTransactionsLoaded}
            />
          )}
        </div>
      )}

      {step === 'dashboard' && (
        <Dashboard
          userData={userData}
          analysis={analysis}
          user={user}
          token={token}
          onLogout={handleLogout}
          onRestart={() => setStep('form')}
        />
      )}
    </div>
  );
}

export default App;