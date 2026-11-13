import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import './AppLayout.css';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="saas-app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="saas-main-viewport">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="saas-page-content">
          <div className="saas-page-boundary">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
