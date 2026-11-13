import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/Button';
import Loader from '../components/Loader';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Clock,
  CheckCircle,
  Users,
} from '../components/common/Icons';
import './PrivacySettings.css';

const PrivacySettings = () => {
  const { user, updateUserContext } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    profileVisibility: user?.profileVisibility || 'everyone',
    isMatchAvailable: user?.isMatchAvailable ?? true,
    showWorkoutTime: user?.showWorkoutTime ?? true,
    partnerRequestPermission: user?.partnerRequestPermission || 'everyone',
  });

  useEffect(() => {
    if (user) {
      setSettings({
        profileVisibility: user.profileVisibility || 'everyone',
        isMatchAvailable: user.isMatchAvailable ?? true,
        showWorkoutTime: user.showWorkoutTime ?? true,
        partnerRequestPermission: user.partnerRequestPermission || 'everyone',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/api/users/privacy', settings);
      if (res.data.success) {
        addToast('Privacy preferences updated successfully!', 'success');
        if (res.data.privacySettings) {
          updateUserContext(res.data.privacySettings);
        }
      }
    } catch (error) {
      addToast(error.message || 'Failed to update privacy settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading privacy controls..." />;

  return (
    <div className="privacy-view animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader
        title="Privacy & Safety Controls"
        description="Configure your visibility across partner directories, control who can send workout invitations, and safeguard your training hours."
        badge={
          <span className="badge badge-success">
            <Shield size={12} /> Protected
          </span>
        }
      />

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* 1. Profile Visibility */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Profile Visibility</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Determines who can discover and view your gym profile
              </p>
            </div>
            <Eye size={18} color="var(--primary)" />
          </div>

          <div className="card-body">
            <div className="privacy-radio-tiles">
              {[
                {
                  value: 'everyone',
                  title: 'Everyone (Public to platform)',
                  desc: 'Any registered athlete can view your fitness goals and workout routine.',
                },
                {
                  value: 'sameGym',
                  title: 'Same Gym Only (Recommended)',
                  desc: 'Only athletes registered at your specific gym can discover your profile.',
                },
                {
                  value: 'connections',
                  title: 'Confirmed Connections Only',
                  desc: 'Your profile is completely hidden from public directories except confirmed partners.',
                },
              ].map((opt) => {
                const isSelected = settings.profileVisibility === opt.value;
                return (
                  <div
                    key={opt.value}
                    className={`privacy-tile ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSettings({ ...settings, profileVisibility: opt.value })}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="privacy-tile-title">{opt.title}</span>
                      {isSelected && <CheckCircle size={16} color="var(--primary)" />}
                    </div>
                    <span className="privacy-tile-desc">{opt.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Matchmaking Algorithm Visibility */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Matchmaking Discovery</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Control whether you appear in compatible partner recommendations
              </p>
            </div>
            <Users size={18} color="var(--primary)" />
          </div>

          <div className="card-body">
            <div className="privacy-radio-tiles">
              {[
                {
                  value: true,
                  title: 'Available for Matchmaking',
                  desc: 'Our algorithm will recommend you to other athletes with >60% routine overlap.',
                },
                {
                  value: false,
                  title: 'Hidden from Recommendations (Paused)',
                  desc: 'Pause incoming partner suggestions. Your existing connections will not be affected.',
                },
              ].map((opt) => {
                const isSelected = settings.isMatchAvailable === opt.value;
                return (
                  <div
                    key={String(opt.value)}
                    className={`privacy-tile ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSettings({ ...settings, isMatchAvailable: opt.value })}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="privacy-tile-title">{opt.title}</span>
                      {isSelected && <CheckCircle size={16} color="var(--primary)" />}
                    </div>
                    <span className="privacy-tile-desc">{opt.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Workout Time Privacy */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Workout Time Visibility</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Choose whether candidates see your exact arrival and departure times
              </p>
            </div>
            <Clock size={18} color="var(--primary)" />
          </div>

          <div className="card-body">
            <div className="privacy-radio-tiles">
              {[
                {
                  value: true,
                  title: 'Show Exact Workout Hours',
                  desc: 'Candidates can see your scheduled hours (e.g. 17:00 - 18:30) to verify schedule fit.',
                },
                {
                  value: false,
                  title: 'Hide Exact Hours (Show Days Only)',
                  desc: 'Matching still calculates overlap in the background, but candidates only see days and muscle splits.',
                },
              ].map((opt) => {
                const isSelected = settings.showWorkoutTime === opt.value;
                return (
                  <div
                    key={String(opt.value)}
                    className={`privacy-tile ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSettings({ ...settings, showWorkoutTime: opt.value })}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="privacy-tile-title">{opt.title}</span>
                      {isSelected && <CheckCircle size={16} color="var(--primary)" />}
                    </div>
                    <span className="privacy-tile-desc">{opt.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Partner Request Permissions */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Partner Request Permissions</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Filter who is permitted to send you workout invitations
              </p>
            </div>
            <Lock size={18} color="var(--primary)" />
          </div>

          <div className="card-body">
            <div className="privacy-radio-tiles">
              {[
                {
                  value: 'everyone',
                  title: 'Accept Requests from Everyone',
                  desc: 'Any registered athlete at your gym can send you partnership invitations.',
                },
                {
                  value: 'matchesOnly',
                  title: 'Verified Matches Only (>60% Match)',
                  desc: 'Only athletes with a calculated schedule overlap of 60% or higher can send invites.',
                },
                {
                  value: 'nobody',
                  title: 'Nobody (Disable Invitations)',
                  desc: 'Temporarily reject all incoming invitations. Existing partners remain connected.',
                },
              ].map((opt) => {
                const isSelected = settings.partnerRequestPermission === opt.value;
                return (
                  <div
                    key={opt.value}
                    className={`privacy-tile ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSettings({ ...settings, partnerRequestPermission: opt.value })}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="privacy-tile-title">{opt.title}</span>
                      {isSelected && <CheckCircle size={16} color="var(--primary)" />}
                    </div>
                    <span className="privacy-tile-desc">{opt.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Save Bar */}
        <div className="card-footer" style={{ padding: '1.25rem 1.5rem', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Privacy Preferences'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PrivacySettings;
