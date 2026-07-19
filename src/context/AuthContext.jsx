import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data.data);
      } catch (error) {
        console.error('Failed to fetch user', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      if (response.data.success) {
        const { token: newToken, data: userData } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        addToast('Login successful!', 'success');
        return true;
      }
    } catch (error) {
      addToast(error.message || 'Login failed', 'error');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      if (response.data.success) {
        addToast('Registration successful! Please log in.', 'success');
        return true;
      }
    } catch (error) {
      addToast(error.message || 'Registration failed', 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    addToast('Logged out successfully', 'info');
  };
  
  const updateUserContext = (newUserData) => {
    setUser((prev) => ({ ...prev, ...newUserData }));
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, register, logout, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
};
