import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/Button';
import Input from '../components/Input';
import Loader from '../components/Loader';
import EmptyState from '../components/common/EmptyState';
import UserAvatar from '../components/common/UserAvatar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  Zap,
  Clock,
  Dumbbell,
  CheckCircle,
  Users,
  AlertCircle,
  ArrowRight,
  Plus,
} from '../components/common/Icons';
import './LookingToday.css';

const ALL_MUSCLES = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Forearms',
  'Core',
  'Cardio',
  'Full Body',
];

const LookingToday = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isLookingToday, setIsLookingToday] = useState(false);
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:30');
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    checkStatusAndFetchMatches();
  }, []);

  const checkStatusAndFetchMatches = async () => {
    try {
      const res = await api.get('/api/today/matches');
      if (res.data.success) {
        setIsLookingToday(true);
        setTodayMatches(res.data.todayMatches || []);
      }
    } catch (error) {
      setIsLookingToday(false);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      const res = await api.post('/api/today/activate');
      if (res.data.success) {
        setIsLookingToday(true);
        addToast('Activated Looking Today status!', 'success');
        checkStatusAndFetchMatches();
      }
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Failed to activate', 'error');
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      const res = await api.post('/api/today/deactivate');
      if (res.data.success) {
        setIsLookingToday(false);
        setTodayMatches([]);
        setShowDeactivateDialog(false);
        addToast('Looking Today status deactivated.', 'info');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to deactivate', 'error');
    } finally {
      setDeactivating(false);
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await Promise.all([
        api.put('/api/today/workout', { muscleGroups: selectedMuscles }),
        api.put('/api/today/time', { startTime, endTime }),
      ]);
      addToast("Today's workout details updated!", 'success');
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      checkStatusAndFetchMatches();
    } catch (error) {
      addToast('Failed to update details', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const toggleMuscle = (muscle) => {
    if (selectedMuscles.includes(muscle)) {
      setSelectedMuscles(selectedMuscles.filter((m) => m !== muscle));
    } else {
      setSelectedMuscles([...selectedMuscles, muscle]);
    }
  };

  const sendRequest = async (receiverId) => {
    try {
      const res = await api.post('/api/partner-requests', { receiverId });
      if (res.data.success) {
        addToast('Partner request sent successfully!', 'success');
      }
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Failed to send request', 'error');
    }
  };

  if (loading) return <Loader text="Checking today's workout status..." />;

  return (
    <div className="looking-today-view animate-fade-in">
      <PageHeader
        title="Looking for Partner Today"
        description="Instant same-day matchmaking. Activate your availability to find other members at your gym training at the same hours today."
        badge={
          isLookingToday ? (
            <span className="badge badge-success">
              <span className="badge-dot" /> Active Now
            </span>
          ) : (
            <span className="badge badge-neutral">Offline</span>
          )
        }
      />

      {!user?.gymId ? (
        <EmptyState
          icon={AlertCircle}
          title="Gym Location Required"
          description="You must select your gym in your profile before you can match with other athletes today."
          action={
            <Button variant="primary" onClick={() => navigate('/profile')}>
              Select Gym <ArrowRight size={14} />
            </Button>
          }
        />
      ) : !isLookingToday ? (
        <div className="card text-center py-8 px-6 activation-hero-card mb-6">
          <div className="activation-icon-wrapper mb-4">
            <Zap size={32} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Ready to train today at {user.gymId}?
          </h2>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              maxWidth: '440px',
              margin: '0 auto 1.5rem',
            }}
          >
            By activating Looking Today, your profile and training window become visible to other
            members at your gym with at least 30 minutes of time overlap.
          </p>
          <Button variant="primary" size="lg" onClick={handleActivate}>
            <Zap size={16} /> Activate Looking Today
          </Button>
        </div>
      ) : (
        <div className="looking-today-active-layout flex flex-col gap-6">
          {/* Status & Timing Form Card */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--success-subtle)',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Zap size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', margin: 0 }}>Status: Currently Active</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                    Visible to {user.gymId} members for today's session
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeactivateDialog(true)}
              >
                Deactivate Status
              </Button>
            </div>

            <div className="card-body">
              <form onSubmit={handleUpdateDetails}>
                <h4 style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>
                  Update Today's Workout Details
                </h4>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input
                    label="Workout Start Time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                  <Input
                    label="Workout End Time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-4">
                  <label className="form-label">
                    Target Muscle Groups Today
                    <span className="form-label-hint">Select what you plan to train</span>
                  </label>
                  <div className="muscle-chips-selector">
                    {ALL_MUSCLES.map((muscle) => {
                      const isSelected = selectedMuscles.includes(muscle);
                      return (
                        <button
                          key={muscle}
                          type="button"
                          className={`muscle-chip-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleMuscle(muscle)}
                        >
                          <Dumbbell size={12} />
                          {muscle}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button type="submit" variant="primary" disabled={updating}>
                    {updating ? 'Saving...' : updateSuccess ? '✓ Details Saved' : 'Update Today’s Details'}
                  </Button>
                  {updateSuccess && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--success)' }}>
                      Match pool updated automatically!
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Today's Matched Partners */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: '1.125rem', margin: 0 }}>
                Partners Training Today ({todayMatches.length})
              </h3>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Min 30-min time overlap required
              </span>
            </div>

            {todayMatches.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No one else has checked in yet"
                description="You are active in the today's partner directory! We'll notify you as soon as someone with an overlapping time slot activates their status."
              />
            ) : (
              <div className="today-matches-grid">
                {todayMatches.map((match) => {
                  const { candidate, overlapMinutes, commonWorkouts } = match;
                  return (
                    <div key={candidate.userId._id} className="card today-match-card flex flex-col justify-between">
                      <div className="card-body">
                        <div className="flex items-center gap-3 mb-3">
                          <UserAvatar name={candidate.userId.username} size="md" />
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate" style={{ fontSize: '0.9375rem', margin: 0 }}>
                              {candidate.userId.username}
                            </h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {candidate.startTime && candidate.endTime
                                ? `${candidate.startTime} - ${candidate.endTime}`
                                : 'Exact times private'}
                            </span>
                          </div>
                          <span className="badge badge-success">
                            {overlapMinutes} min overlap
                          </span>
                        </div>

                        {commonWorkouts && commonWorkouts.length > 0 && (
                          <div className="mb-2">
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Common Split:{' '}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {commonWorkouts.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="card-footer" style={{ padding: '0.75rem 1.25rem' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => sendRequest(candidate.userId._id)}
                        >
                          Send Partner Request
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Deactivation Dialog */}
      <ConfirmDialog
        isOpen={showDeactivateDialog}
        onClose={() => setShowDeactivateDialog(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Looking Today?"
        message="Your profile will be removed from today's matching pool until you activate it again."
        confirmText="Deactivate"
        variant="danger"
        loading={deactivating}
      />
    </div>
  );
};

export default LookingToday;
