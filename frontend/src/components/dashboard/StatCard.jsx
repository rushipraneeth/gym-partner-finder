import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from '../common/Icons';

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  badge,
  linkTo,
  linkLabel,
  color = 'primary',
}) => {
  const content = (
    <div
      className={`card ${linkTo ? 'card-interactive' : ''}`}
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            {title}
          </span>
          {Icon && (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: `var(--${color}-subtle)`,
                color: `var(--${color})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={16} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {value}
          </span>
          {badge && <div>{badge}</div>}
        </div>

        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      {linkTo && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--primary)',
          }}
        >
          <span>{linkLabel || 'View details'}</span>
          <ChevronRight size={14} />
        </div>
      )}
    </div>
  );

  return linkTo ? (
    <Link to={linkTo} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      {content}
    </Link>
  ) : (
    content
  );
};

export default StatCard;
