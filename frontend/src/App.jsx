import { useState } from 'react';
import axios from 'axios';
import Landing from './pages/Landing';
import OnboardingForm from './pages/OnboardingForm';
import Transactions from './pages/Transactions';
import Dashboard from './pages/Dashboard';

function App() {
  const [step, setStep] = useState('landing');
  const [userData, setUserData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = (data) => {
    setUserData(data);
    setStep('transactions');
  };

  const handleTransactionsLoaded = async (txns, summary) => {
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/analyze',
        { ...userData, transactions: summary }
      );
      setAnalysis(response.data.analysis);
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
        <Landing onStart={() => setStep('form')} />
      )}

      {step === 'form' && (
        <OnboardingForm onSubmit={handleFormSubmit} />
      )}

      {step === 'transactions' && (
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: '#4f46e5', fontSize: '26px', fontWeight: '800' }}>
              💰 FinSmart
            </h1>
            <p style={{ color: '#64748b', marginTop: '4px' }}>
              Step 2 of 2 — Connect your bank for real insights
            </p>
          </div>

          {loading ? (
            <div style={{
              textAlign: 'center', padding: '60px',
              background: 'white', borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <p style={{ fontSize: '48px' }}>🤖</p>
              <p style={{
                fontSize: '20px', fontWeight: '700',
                color: '#4f46e5', marginTop: '16px'
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
            <Transactions onTransactionsLoaded={handleTransactionsLoaded} />
          )}
        </div>
      )}

      {step === 'dashboard' && (
        <Dashboard userData={userData} analysis={analysis} />
      )}

    </div>
  );
}

export default App;