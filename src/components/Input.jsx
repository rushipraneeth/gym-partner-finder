import React from 'react';
import './Input.css';

const Input = ({ label, id, error, ...props }) => {
  return (
    <div className="form-group">
      {label && <label htmlFor={id} className="form-label">{label}</label>}
      <input id={id} className={`form-input ${error ? 'input-error' : ''}`} {...props} />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default Input;
