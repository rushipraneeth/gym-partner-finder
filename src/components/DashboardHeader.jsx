import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const DashboardHeader = () => {
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { label: 'Overview', path: '/' },
    { label: 'Matches', path: '/matches' },
    { label: 'Requests', path: '/requests' },
    { label: 'Schedule', path: '/schedule' },
    { label: 'Connections', path: '/connections' }
  ];

  return (
    <div className="mb-6 mt-2">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 style={{ fontSize: '3.2rem', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Finding <span style={{display: 'inline-flex', background: 'rgba(0,0,0,0.04)', borderRadius: '50%', width: '40px', height: '40px', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'}}>🏃</span> Your Perfect
          </h1>
          <h1 style={{ fontSize: '3.2rem', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            and <span style={{display: 'inline-flex', background: 'var(--accent-lime)', borderRadius: '50%', width: '40px', height: '40px', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'}}>✨</span> Workout Partners
          </h1>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/settings" 
            style={{textDecoration: 'none', width: '44px', height: '44px', borderRadius: '12px', background: '#151515', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', transition: 'all 0.2s ease', color: '#777'}} 
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'white';
            }} 
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#777';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </Link>
          <Link to="/looking-today" style={{background: '#1a1b1e', color: 'white', padding: '0 1.5rem', borderRadius: '99px', display: 'flex', alignItems: 'center', fontWeight: 500, textDecoration: 'none'}}>
            + Activate Looking Today
          </Link>
        </div>
      </div>
      
      {/* TAB PILLS */}
      <div className="flex gap-2 overflow-x-auto" style={{paddingBottom: '0.5rem'}}>
        {tabs.map(tab => {
          const isActive = path === tab.path || (path === '' && tab.path === '/');
          return (
            <Link 
              key={tab.label} 
              to={tab.path} 
              style={{
                textDecoration: 'none', 
                background: isActive ? '#1a1b1e' : 'rgba(0,0,0,0.04)', 
                color: isActive ? 'white' : '#1a1b1e', 
                padding: '0.5rem 1.25rem', 
                borderRadius: '99px', 
                fontSize: '0.9rem', 
                fontWeight: 500, 
                cursor: 'pointer', 
                transition: 'background 0.2s'
              }} 
              onMouseOver={(e) => { if (!isActive) e.target.style.background = 'rgba(0,0,0,0.08)' }} 
              onMouseOut={(e) => { if (!isActive) e.target.style.background = 'rgba(0,0,0,0.04)' }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardHeader;
