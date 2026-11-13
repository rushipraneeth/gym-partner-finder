import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Dumbbell, 
  ExternalLink, 
  ArrowDown, 
  Users, 
  Zap, 
  Calendar, 
  Eye, 
  EyeOff 
} from '../components/common/Icons';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const success = await login(email.trim(), password);
    setLoading(false);
    if (success) {
      navigate('/');
    }
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
        {/* LEFT COLUMN: BRANDING & PITCH */}
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
              href="https://github.com/rushipraneeth/gym-partner-finder" 
              target="_blank" 
              rel="noreferrer" 
              className="link-github"
            >
              View on GitHub <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: WELCOME BACK CARD */}
        <div className="welcome-auth-container animate-fade-in">
          <div className="auth-wrapper-floating-card">
            <h2 className="auth-outer-headline">Welcome Back</h2>

            <div className="auth-inner-white-box">
              <h3 className="auth-inner-title">Sign in</h3>

              <form onSubmit={handleLoginSubmit}>
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
                  <div className="password-input-wrapper">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-field-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="auth-sub-actions">
                  <a 
                    href="#forgot" 
                    className="auth-forgot-link"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('To reset your password, contact support or register a fresh account.');
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
