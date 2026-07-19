import React from 'react';

const Loader = ({ fullScreen = false }) => {
  const loaderStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: fullScreen ? '100vh' : '100%',
    width: '100%'
  };

  const spinnerStyle = {
    width: '40px',
    height: '40px',
    border: '4px solid var(--border-color)',
    borderTop: '4px solid var(--accent-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return (
    <div style={loaderStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={spinnerStyle}></div>
    </div>
  );
};

export default Loader;
