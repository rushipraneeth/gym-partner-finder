import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Input from '../components/Input';

const Settings = () => {
  const { logout } = useAuth();
  const { addToast } = useToast();

  const handleSimulatedPasswordChange = (e) => {
    e.preventDefault();
    addToast('Password change request simulated. Backend endpoint is not available.', 'info');
  };

  return (
    <div className="settings-page animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="mb-4">Account Settings</h1>

      <div className="glass-card mb-4">
        <h3 className="mb-4">Security</h3>
        <form onSubmit={handleSimulatedPasswordChange}>
          <Input label="Current Password" type="password" required />
          <Input label="New Password" type="password" required />
          <Input label="Confirm New Password" type="password" required />
          
          <Button type="submit" variant="primary" className="mt-2">
            Update Password
          </Button>
        </form>
      </div>

      <div className="glass-card mb-4">
        <h3 className="mb-4 text-error">Danger Zone</h3>
        <p className="text-secondary mb-4">Sign out of your account on this device.</p>
        <Button variant="danger" onClick={logout}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Settings;
