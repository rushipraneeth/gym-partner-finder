import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          ☰
        </button>
      </div>
      
      <div className="navbar-right">
        <div className="user-profile-badge">
          <div className="avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="username d-none-sm">{user?.username || 'User'}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
