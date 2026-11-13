import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Dumbbell, 
  Key, 
  ExternalLink, 
  ArrowDown, 
  Users, 
  Zap, 
  Calendar, 
  Shield 
} from '../components/common/Icons';
import './Auth.css';

const DEMO_EMAIL = 's.rushipraneeth@gmail.com';
const DEMO_PASSWORD = 'Rushi@123';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoNotice, setDemoNotice] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  const fillDemoCredentials = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setDemoNotice(true);
    setTimeout(() => setDemoNotice(false), 3500);
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('features-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="welcome-page-wrapper">
      <div className="welcome-hero-container">
        {/* LEFT COLUMN: BRANDING & DEMO ACCESS */}
        <div className="welcome-brand-side animate-fade-in">
          {/* Brand Lockup */}
          <div className="brand-header-lockup">
            <div className="brand-icon-card">
              <Dumbbell size={30} color="#2563eb" strokeWidth={2.4} />
            </div>
            <h1 className="welcome-brand-title">GymPartner</h1>
          </div>

          {/* Pitch Text */}
          <p className="welcome-pitch-text">
            Stop working out alone. GymPartner is the collaborative fitness platform 
            designed for discovering reliable workout partners at your gym with matching 
            schedules and goals. Explore our Features!
          </p>

          {/* Action Buttons */}
          <div className="welcome-actions-row">
            <button 
              type="button" 
              onClick={scrollToFeatures} 
              className="btn-explore"
            >
              Explore Features <ArrowDown size={14} />
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="link-github"
            >
              View on GitHub <ExternalLink size={13} />
            </a>
          </div>

          {/* Recruiter / Demo Access Card */}
          <div 
            className="demo-access-card" 
            onClick={fillDemoCredentials}
            title="Click to auto-fill demo credentials"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') fillDemoCredentials(); }}
          >
            <div className="demo-card-icon-badge">
              <Key size={20} />
            </div>
            <div className="demo-card-content">
              <div className="demo-card-header-label">
                <span>RECRUITER / DEMO ACCESS</span>
                <span className={`demo-pill-click ${demoNotice ? 'active-filled' : ''}`}>
                  {demoNotice ? '✓ Filled!' : 'Click to Auto-fill'}
                </span>
              </div>
              <div className="demo-field-row">
                <span className="demo-field-label">Email:</span>
                <span className="demo-field-value">{DEMO_EMAIL}</span>
              </div>
              <div className="demo-field-row">
                <span className="demo-field-label">password:</span>
                <span className="demo-field-value">{DEMO_PASSWORD}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WELCOME BACK CARD */}
        <div className="welcome-auth-container animate-fade-in">
          <div className="auth-wrapper-floating-card">
            <h2 className="auth-outer-headline">Welcome Back</h2>

            <div className="auth-inner-white-box">
              <h3 className="auth-inner-title">Sign in</h3>

              <form onSubmit={handleSubmit}>
                <div className="auth-form-field">
                  <label htmlFor="auth-email">Email</label>
                  <input
                    id="auth-email"
                    type="email"
                    className="auth-field-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="auth-form-field">
                  <label htmlFor="auth-password">Password</label>
                  <input
                    id="auth-password"
                    type="password"
                    className="auth-field-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div className="auth-sub-actions">
                  <a 
                    href="#forgot" 
                    className="auth-forgot-link"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('To reset your password, contact support or create a fresh account.');
                    }}
                  >
                    Forgot password?
                  </a>
                </div>

                <button 
                  type="submit" 
                  className="btn-auth-submit" 
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Login'}
                </button>
              </form>

              <div className="auth-switch-link-footer">
                Don't have an account? <Link to="/register">Sign up</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FEATURE SHOWCASE */}
      <section id="features-showcase" className="welcome-features-section">
        <h2 className="features-section-title">Built for Serious Training Consistency</h2>
        <p className="features-section-sub">
          Everything you need to find the right partner, align workout splits, and stay accountable.
        </p>

        <div className="features-cards-grid">
          <div className="welcome-feature-card">
            <div className="feature-icon-box">
              <Users size={22} />
            </div>
            <h3 className="feature-card-title">Intelligent Matchmaking</h3>
            <p className="feature-card-desc">
              Weighted algorithm scoring based on matching gym locations, shared workout days, 
              fitness goals, and muscle split synergy.
            </p>
          </div>

          <div className="welcome-feature-card">
            <div className="feature-icon-box">
              <Zap size={22} />
            </div>
            <h3 className="feature-card-title">Looking Today Radar</h3>
            <p className="feature-card-desc">
              Need a spotter right now? Broadcast your availability for same-day sessions with 
              real-time notifications and instant chat.
            </p>
          </div>

          <div className="welcome-feature-card">
            <div className="feature-icon-box">
              <Calendar size={22} />
            </div>
            <h3 className="feature-card-title">Interactive Schedule Sync</h3>
            <p className="feature-card-desc">
              Visualize your 7-day training schedule side-by-side with prospective partners 
              to identify perfect workout time overlaps.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
