import React from 'react';

const AVATAR_COLORS = [
  { bg: 'rgba(59, 130, 246, 0.15)', text: '#2563eb' }, // Blue
  { bg: 'rgba(16, 185, 129, 0.15)', text: '#059669' }, // Emerald
  { bg: 'rgba(168, 85, 247, 0.15)', text: '#7c3aed' }, // Purple
  { bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706' }, // Amber
  { bg: 'rgba(236, 72, 153, 0.15)', text: '#db2777' }, // Pink
  { bg: 'rgba(20, 184, 166, 0.15)', text: '#0d9488' }, // Teal
  { bg: 'rgba(99, 102, 241, 0.15)', text: '#4f46e5' }, // Indigo
];

const getColorForString = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const UserAvatar = ({ name = '?', size = 'md', isOnline = false, className = '' }) => {
  const initial = (name ? name.charAt(0) : '?').toUpperCase();
  const color = getColorForString(name);

  const sizeStyles = {
    xs: { width: '24px', height: '24px', fontSize: '0.6875rem' },
    sm: { width: '32px', height: '32px', fontSize: '0.8125rem' },
    md: { width: '40px', height: '40px', fontSize: '0.9375rem' },
    lg: { width: '48px', height: '48px', fontSize: '1.125rem' },
    xl: { width: '64px', height: '64px', fontSize: '1.5rem' },
  }[size] || { width: '40px', height: '40px', fontSize: '0.9375rem' };

  return (
    <div
      className={`user-avatar-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          ...sizeStyles,
          backgroundColor: color.bg,
          color: color.text,
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          border: '1px solid rgba(0, 0, 0, 0.05)',
          userSelect: 'none',
        }}
      >
        {initial}
      </div>
      {isOnline && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: size === 'xs' || size === 'sm' ? '8px' : '10px',
            height: size === 'xs' || size === 'sm' ? '8px' : '10px',
            backgroundColor: 'var(--success)',
            border: '2px solid var(--bg-surface)',
            borderRadius: '50%',
          }}
        />
      )}
    </div>
  );
};

export default UserAvatar;
