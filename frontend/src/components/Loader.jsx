import React from 'react';

const Loader = ({ fullScreen = false, text = '', size = 'md' }) => {
  const spinnerSize = size === 'sm' ? 20 : size === 'lg' ? 44 : 32;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.75rem',
        minHeight: fullScreen ? '100vh' : '220px',
        width: '100%',
        backgroundColor: fullScreen ? 'var(--bg-canvas)' : 'transparent',
      }}
    >
      <svg
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animation: 'spin 0.75s linear infinite' }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="var(--border-default)"
          strokeWidth="3"
        />
        <path
          d="M12 2C6.47715 2 2 6.47715 2 12"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {text && (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {text}
        </span>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
