import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import UserAvatar from '../common/UserAvatar';
import { Menu, Sun, Moon } from '../common/Icons';
import './Navbar.css';

const PAGE_TITLES = {
  '/': 'Overview',
  '/matches': 'Find Partners',
  '/looking-today': 'Looking Today',
  '/schedule': 'Workout Schedule',
  '/requests': 'Partner Requests',
  '/connections': 'Connections',
  '/chat': 'Messages',
  '/profile': 'My Profile',
  '/privacy-settings': 'Privacy Settings',
  '/settings': 'Account Settings',
};

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const currentTitle = PAGE_TITLES[location.pathname] || 'Dashboard';

  return (
    <header className="saas-topbar">
      <div className="topbar-left">
        <button
          className="topbar-menu-trigger"
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-breadcrumbs">
          <span className="breadcrumb-root">App</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{currentTitle}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Theme Toggle Button */}
        <button
          className="topbar-icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* User Profile Mini Badge */}
        <Link to="/profile" className="topbar-profile-link">
          <UserAvatar name={user?.username || 'User'} size="sm" isOnline />
          <span className="topbar-username">{user?.username || 'User'}</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
