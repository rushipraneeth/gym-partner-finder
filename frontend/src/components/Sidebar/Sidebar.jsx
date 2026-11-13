import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import UserAvatar from '../common/UserAvatar';
import {
  LayoutDashboard,
  Users,
  Compass,
  Zap,
  Calendar,
  Inbox,
  UserCheck,
  MessageSquare,
  User,
  Shield,
  Settings,
  LogOut,
  Sun,
  Moon,
  Dumbbell,
  X,
} from '../common/Icons';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [isLookingTodayActive, setIsLookingTodayActive] = useState(false);

  useEffect(() => {
    // Fetch pending requests badge
    const fetchBadges = async () => {
      try {
        const reqRes = await api.get('/api/partner-requests/received').catch(() => null);
        if (reqRes?.data?.success) {
          const pending = reqRes.data.receivedRequests.filter((r) => r.status === 'pending').length;
          setPendingRequestsCount(pending);
        }

        const todayRes = await api.get('/api/today/matches').catch(() => null);
        if (todayRes?.data?.success) {
          setIsLookingTodayActive(true);
        }
      } catch (err) {
        // silent catch
      }
    };

    if (user) {
      fetchBadges();
    }
  }, [user, location.pathname]);

  const mainNavItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Find Partners', path: '/matches', icon: Users },
    { label: 'Discover', path: '/matches?tab=all', icon: Compass },
    {
      label: 'Looking Today',
      path: '/looking-today',
      icon: Zap,
      badge: isLookingTodayActive ? { text: 'Active', type: 'success' } : null,
    },
    { label: 'My Schedule', path: '/schedule', icon: Calendar },
    {
      label: 'Requests',
      path: '/requests',
      icon: Inbox,
      badge: pendingRequestsCount > 0 ? { text: pendingRequestsCount, type: 'primary' } : null,
    },
    { label: 'Connections', path: '/connections', icon: UserCheck },
    { label: 'Messages', path: '/chat', icon: MessageSquare },
  ];

  const accountNavItems = [
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Privacy', path: '/privacy-settings', icon: Shield },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const isActiveLink = (item) => {
    if (item.path === '/matches?tab=all') {
      return location.pathname === '/matches' && location.search.includes('tab=all');
    }
    if (item.path === '/matches') {
      return location.pathname === '/matches' && !location.search.includes('tab=all');
    }
    return location.pathname === item.path;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-mobile-backdrop" onClick={onClose} />}

      <aside className={`saas-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-mark">
            <Dumbbell size={20} color="#ffffff" strokeWidth={2.2} />
          </div>
          <div className="brand-text-block">
            <span className="brand-title">GymPartner</span>
          </div>

          <button className="sidebar-mobile-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="sidebar-scroll-area">
          <div className="sidebar-nav-section">
            <span className="nav-section-title">MAIN</span>
            <nav className="nav-items-list">
              {mainNavItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActiveLink(item);
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={`nav-item-link ${active ? 'active' : ''}`}
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                  >
                    <IconComponent size={18} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {item.badge && (
                      <span className={`nav-badge badge-${item.badge.type}`}>
                        {item.badge.text}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="sidebar-nav-section">
            <span className="nav-section-title">ACCOUNT</span>
            <nav className="nav-items-list">
              {accountNavItems.map((item) => {
                const IconComponent = item.icon;
                const active = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={`nav-item-link ${active ? 'active' : ''}`}
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                  >
                    <IconComponent size={18} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Card Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <UserAvatar name={user?.username || 'User'} size="sm" isOnline />
            <div className="sidebar-user-meta">
              <span className="user-name">{user?.username || 'User'}</span>
              <span className="user-gym">{user?.gymId || 'No gym chosen'}</span>
            </div>
            <div className="sidebar-user-actions">
              <button
                className="footer-action-btn"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button
                className="footer-action-btn danger"
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
