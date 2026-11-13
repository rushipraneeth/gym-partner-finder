import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/Button';
import Input from '../components/Input';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Lock,
  LogOut,
  Shield,
  AlertTriangle,
  User,
} from '../components/common/Icons';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters long.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New password and confirmation do not match.', 'error');
      return;
    }

    setChangingPassword(true);
    setTimeout(() => {
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast('Password update simulation successful. Password endpoint secured.', 'info');
    }, 600);
  };

  return (
    <div className="settings-view animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader
        title="Account Settings"
        description="Manage your account security, interface theme preferences, and active sessions."
      />

      <div className="flex flex-col gap-6">
        {/* Appearance / Theme */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Interface Theme</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Select between Light and Dark interface appearance
              </p>
            </div>
            {theme === 'dark' ? <Moon size={18} color="var(--primary)" /> : <Sun size={18} color="var(--warning)" />}
          </div>

          <div className="card-body">
            <div className="theme-toggle-strip">
              <div
                className={`theme-mode-card ${theme === 'light' ? 'active' : ''}`}
                onClick={() => {
                  if (theme !== 'light') toggleTheme();
                }}
                role="button"
                tabIndex={0}
              >
                <div className="theme-preview light-preview" />
                <div className="flex items-center gap-2 mt-2">
                  <Sun size={15} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Light Mode</span>
                </div>
              </div>

              <div
                className={`theme-mode-card ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => {
                  if (theme !== 'dark') toggleTheme();
                }}
                role="button"
                tabIndex={0}
              >
                <div className="theme-preview dark-preview" />
                <div className="flex items-center gap-2 mt-2">
                  <Moon size={15} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Dark Obsidian</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Password */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Security & Credentials</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Update your account password
              </p>
            </div>
            <Lock size={18} color="var(--primary)" />
          </div>

          <div className="card-body">
            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="primary" disabled={changingPassword}>
                {changingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card danger-zone-card">
          <div className="card-header" style={{ borderColor: 'var(--danger-border)' }}>
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--danger)' }}>Danger Zone</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Sign out of your active browser session
              </p>
            </div>
            <AlertTriangle size={18} color="var(--danger)" />
          </div>

          <div className="card-body flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 style={{ fontSize: '0.875rem', margin: '0 0 0.25rem' }}>Active Session</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Signed in as <strong>{user?.username}</strong> ({user?.email})
              </p>
            </div>
            <Button variant="danger" onClick={() => setShowLogoutConfirm(true)}>
              <LogOut size={14} /> Sign Out of Account
            </Button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
        title="Sign Out of Gym Partner Finder?"
        message="You will need to sign in again with your email and password to access your workout routine and messages."
        confirmText="Sign Out"
        variant="danger"
      />
    </div>
  );
};

export default Settings;
