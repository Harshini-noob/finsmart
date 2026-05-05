import './Landing.css';

const Landing = ({ onStart,onLogin }) => {
  return (
    <div className="landing">

      {/* Nav */}
<nav className="landing-nav">
  <h1 className="nav-logo">💰 FinSmart</h1>
  <div className="nav-btns">
    <button className="nav-login-btn" onClick={onLogin}>
      Login
    </button>
    <button className="nav-btn" onClick={onStart}>
      Get Started Free →
    </button>
  </div>
</nav>

      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">🇮🇳 Built for India</div>
        <h1 className="hero-title">
          Your Personal AI<br />
          <span className="hero-highlight">Financial Advisor</span>
        </h1>
        <p className="hero-sub">
          95% of Indians have no financial plan.<br />
          Get a CA-level financial analysis in 60 seconds — completely free.
        </p>
        <button className="hero-btn" onClick={onStart}>
          ✨ Get My Free Financial Report
        </button>
        <p className="hero-note">
          🔒 Private & secure — your data is never stored
        </p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-box">
          <p className="stat-num">₹25,000+</p>
          <p className="stat-desc">Cost of a CA/year</p>
        </div>
        <div className="stat-box highlight">
          <p className="stat-num">₹0</p>
          <p className="stat-desc">Cost of FinSmart</p>
        </div>
        <div className="stat-box">
          <p className="stat-num">60 sec</p>
          <p className="stat-desc">To get your report</p>
        </div>
        <div className="stat-box">
          <p className="stat-num">95%</p>
          <p className="stat-desc">Indians without a plan</p>
        </div>
      </div>

      {/* Features */}
      <div className="features">
        <h2 className="features-title">Everything you need in one place</h2>
        <div className="features-grid">

          <div className="feature-card">
            <span className="feature-icon">🏦</span>
            <h3>Real Bank Data</h3>
            <p>Connect your bank via RBI's Account Aggregator. No passwords needed. See your actual spending.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Money Health Score</h3>
            <p>Get a single score out of 100 that tells you exactly how financially healthy you are right now.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">💸</span>
            <h3>Tax Wizard</h3>
            <p>Find every rupee you're missing under 80C, 80D, NPS. Most Indians overpay ₹40,000+ in tax.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🔮</span>
            <h3>What If Simulator</h3>
            <p>Test any financial decision before making it. See exactly how it affects your score.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">💬</span>
            <h3>AI Chat Advisor</h3>
            <p>Ask anything in plain English. Get answers specific to your income, goals, and situation.</p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <h3>Action Plan</h3>
            <p>Not vague tips — exact rupee amounts and steps to take this week, this month, this year.</p>
          </div>

        </div>
      </div>

      {/* How it works */}
      <div className="how-it-works">
        <h2 className="features-title">How it works</h2>
        <div className="steps-row">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Tell us about yourself</h3>
            <p>Age, income, expenses, savings, and your financial goal</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">2</div>
            <h3>Connect your bank</h3>
            <p>RBI approved Account Aggregator — we never see your password</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">3</div>
            <h3>Get your report</h3>
            <p>AI analyzes your real spending and gives personalized advice</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <h2>Ready to take control of your money?</h2>
        <p>Join thousands of Indians building financial confidence</p>
        <button className="hero-btn" onClick={onStart}>
          ✨ Get Started — It's Free
        </button>
      </div>

      {/* Footer */}
      <div className="landing-footer">
        <p>💰 FinSmart — AI Financial Advisor for India</p>
        <p>Built with ❤️ by Team Binary Brains · IIIT Kottayam</p>
      </div>

    </div>
  );
};

export default Landing;