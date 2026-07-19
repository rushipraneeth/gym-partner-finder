import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // API error (400, 401, 403, 404, 500)
      if (error.response.status === 401) {
        // Handle unauthorized (clear token, etc. - usually handled in AuthContext or app router)
        localStorage.removeItem('token');
        // window.location.href = '/login'; // Alternatively let context handle it via state
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Network failure
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    } else {
      // Something else
      return Promise.reject({ message: error.message });
    }
  }
);

export default api;
