import React from 'react';

export const Skeleton = ({ width, height, borderRadius, style = {}, className = '' }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        borderRadius: borderRadius || 'var(--radius-sm)',
        ...style,
      }}
    />
  );
};

export const CardSkeleton = () => (
  <div className="card" style={{ padding: '1.25rem' }}>
    <div className="flex items-center gap-3 mb-4">
      <Skeleton width="40px" height="40px" borderRadius="50%" />
      <div className="flex-1">
        <Skeleton width="60%" height="16px" style={{ marginBottom: '6px' }} />
        <Skeleton width="40%" height="12px" />
      </div>
    </div>
    <Skeleton width="100%" height="14px" style={{ marginBottom: '8px' }} />
    <Skeleton width="80%" height="14px" style={{ marginBottom: '16px' }} />
    <div className="flex gap-2">
      <Skeleton width="50%" height="32px" borderRadius="var(--radius-md)" />
      <Skeleton width="50%" height="32px" borderRadius="var(--radius-md)" />
    </div>
  </div>
);

export default Skeleton;
