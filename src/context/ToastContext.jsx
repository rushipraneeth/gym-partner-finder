import { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999
      }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{
            background: toast.type === 'error' ? 'var(--error-color)' : 
                        toast.type === 'success' ? 'var(--success-color)' : 'var(--bg-tertiary)',
            color: toast.type === 'info' ? 'var(--text-primary)' : '#fff',
            padding: '12px 20px',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: '250px',
            animation: 'fadeIn 0.3s ease'
          }}>
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} style={{ color: 'inherit', marginLeft: '10px' }}>&times;</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
