import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Button from '../components/Button';
import Loader from '../components/Loader';

const PrivacySettings = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    profileVisibility: 'everyone',
    isMatchAvailable: true,
    showWorkoutTime: true,
    partnerRequestPermission: 'everyone'
  });

  useEffect(() => {
    // In a full implementation, you'd fetch the current settings if the backend provided a GET /api/users/privacy route.
    // Since it doesn't, we'll initialize from /auth/me or assume defaults. The backend doesn't return these in /me by default.
    // But let's check /users/matching-profile or just allow user to set them.
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/api/users/privacy', settings);
      addToast('Privacy settings updated successfully', 'success');
    } catch (error) {
      addToast(error.message || 'Failed to update privacy settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="privacy-settings-page animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="mb-4">Privacy Settings</h1>
      
      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Profile Visibility</label>
            <select 
              className="form-input" 
              value={settings.profileVisibility} 
              onChange={e => setSettings({...settings, profileVisibility: e.target.value})}
            >
              <option value="everyone">Everyone</option>
              <option value="sameGym">Same Gym Only</option>
              <option value="connections">Connections Only</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Match Availability</label>
            <select 
              className="form-input" 
              value={settings.isMatchAvailable} 
              onChange={e => setSettings({...settings, isMatchAvailable: e.target.value === 'true'})}
            >
              <option value="true">Available for Matches</option>
              <option value="false">Hide from Match Recommendations</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Show Workout Time</label>
            <select 
              className="form-input" 
              value={settings.showWorkoutTime} 
              onChange={e => setSettings({...settings, showWorkoutTime: e.target.value === 'true'})}
            >
              <option value="true">Show Exact Times</option>
              <option value="false">Hide Exact Times (Show Days Only)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Partner Request Permissions</label>
            <select 
              className="form-input" 
              value={settings.partnerRequestPermission} 
              onChange={e => setSettings({...settings, partnerRequestPermission: e.target.value})}
            >
              <option value="everyone">Accept from Everyone</option>
              <option value="matchesOnly">Matches Only (&gt;60% Match)</option>
              <option value="nobody">Nobody (Disable Requests)</option>
            </select>
          </div>

          <Button type="submit" variant="primary" className="mt-4" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PrivacySettings;
