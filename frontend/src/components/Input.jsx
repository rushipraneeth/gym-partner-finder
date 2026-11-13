import React from 'react';
import './Input.css';

const Input = ({
  label,
  id,
  error,
  helpText,
  icon: Icon,
  className = '',
  style = {},
  inputStyle = {},
  ...props
}) => {
  return (
    <div className={`form-group ${className}`} style={style}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && (
          <div className="input-icon-left">
            <Icon size={16} />
          </div>
        )}
        <input
          id={id}
          className={`form-input ${error ? 'input-error' : ''} ${Icon ? 'has-icon-left' : ''}`}
          style={{
            ...(Icon ? { paddingLeft: '2.625rem' } : {}),
            ...inputStyle,
          }}
          {...props}
        />
      </div>
      {error && <span className="error-text">{error}</span>}
      {helpText && !error && <span className="form-help">{helpText}</span>}
    </div>
  );
};

export default Input;
