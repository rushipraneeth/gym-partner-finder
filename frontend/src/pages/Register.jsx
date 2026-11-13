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
  Shield
} from '../components/common/Icons';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await register(name, email, password);
    setLoading(false);
    if (success) {
      navigate('/login');
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
          <div className="brand-header-lockup">
            <div className="brand-icon-card">
              <Dumbbell size={30} color="#2563eb" strokeWidth={2.4} />
            </div>
            <h1 className="welcome-brand-title">GymPartner</h1>
          </div>

          <p className="welcome-pitch-text">
            Start training smarter. Connect with fitness partners at your local gym who match 
            your exact schedule, muscle splits, and workout intensity.
          </p>

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

        {/* RIGHT COLUMN: CREATE ACCOUNT CARD */}
        <div className="welcome-auth-container animate-fade-in">
          <div className="auth-wrapper-floating-card">
            <h2 className="auth-outer-headline">Create Account</h2>

            <div className="auth-inner-white-box">
              <h3 className="auth-inner-title">Sign up</h3>

              <form onSubmit={handleSubmit}>
                <div className="auth-form-field">
                  <label htmlFor="register-name">Full Name or Username</label>
                  <input
                    id="register-name"
                    type="text"
                    className="auth-field-input"
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="auth-form-field">
                  <label htmlFor="register-email">Email</label>
                  <input
                    id="register-email"
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
                  <label htmlFor="register-password">Password</label>
                  <input
                    id="register-password"
                    type="password"
                    className="auth-field-input"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-auth-submit" 
                  style={{ marginTop: '0.5rem' }}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Get Started'}
                </button>
              </form>

              <div className="auth-switch-link-footer">
                Already have an account? <Link to="/login">Sign in</Link>
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

export default Register;
