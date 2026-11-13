import React from 'react';

const PageHeader = ({
  title,
  description,
  badge,
  actions,
  children,
  className = '',
}) => {
  return (
    <div
      className={`page-header mb-6 ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {description && (
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                margin: 0,
                maxWidth: '640px',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            {actions}
          </div>
        )}
      </div>

      {children && <div style={{ marginTop: '0.5rem' }}>{children}</div>}
    </div>
  );
};

export default PageHeader;
