import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card">
        <h2 className="text-center text-primary">Gym Partner Finder</h2>
        <p className="text-center text-secondary mb-4">Welcome back! Please login to your account.</p>
        
        <form onSubmit={handleSubmit}>
          <Input 
            label="Email Address" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="john@example.com"
          />
          <Input 
            label="Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
          />
          <Button type="submit" variant="primary" className="w-100 mt-2" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center mt-4">
          Don't have an account? <Link to="/register" className="text-primary font-weight-bold">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
