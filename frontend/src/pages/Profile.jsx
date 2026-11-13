import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/Button';
import Input from '../components/Input';
import Loader from '../components/Loader';
import {
  User,
  MapPin,
  Dumbbell,
  Award,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from '../components/common/Icons';
import './Profile.css';

const GOAL_OPTIONS = [
  { value: 'Muscle Gain', label: 'Muscle Gain & Hypertrophy', desc: 'Focus on progressive overload and size' },
  { value: 'Weight Loss', label: 'Weight Loss & Fat Burn', desc: 'High intensity conditioning and deficit' },
  { value: 'Endurance', label: 'Endurance & Cardio Conditioning', desc: 'Stamina, cardiovascular fitness, circuits' },
  { value: 'General Fitness', label: 'General Fitness & Health', desc: 'Overall wellness, flexibility, and strength' },
  { value: 'Powerlifting', label: 'Powerlifting & Max Strength', desc: 'Heavy Squat, Bench, and Deadlift training' },
];

const EXP_OPTIONS = [
  { value: 'Beginner', label: 'Beginner', desc: '0 - 1 years of consistent gym training' },
  { value: 'Intermediate', label: 'Intermediate', desc: '1 - 3 years of structured routine training' },
  { value: 'Advanced', label: 'Advanced', desc: '3+ years of serious athletic or bodybuilding experience' },
];

const Profile = () => {
  const { user, updateUserContext } = useAuth();
  const { addToast } = useToast();

  const [gymId, setGymId] = useState(user?.gymId || '');
  const [goal, setGoal] = useState(user?.goal || '');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || '');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Geolocation Gym Discovery
  const [nearbyGyms, setNearbyGyms] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setGymId(user.gymId || '');
      setGoal(user.goal || '');
      setExperienceLevel(user.experienceLevel || '');
      setLoading(false);
    }
  }, [user]);

  const findNearbyGyms = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const delta = 0.045;
          const viewbox = `${longitude - delta},${latitude + delta},${longitude + delta},${latitude - delta}`;
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=gym&viewbox=${viewbox}&bounded=1&limit=20`;
          const response = await fetch(url);

          if (!response.ok) throw new Error('Failed to fetch from Nominatim');

          const data = await response.json();
          const gyms = data
            .filter((el) => el.name || el.display_name)
            .map((el) => ({
              id: `nom-${el.place_id}`,
              name:
                el.name && el.name.toLowerCase() !== 'gym'
                  ? el.name
                  : el.display_name.split(',')[0] || 'Local Gym',
            }));

          const uniqueGyms = Array.from(new Map(gyms.map((item) => [item.name, item])).values());

          if (uniqueGyms.length > 0) {
            setNearbyGyms(uniqueGyms);
            addToast(`Found ${uniqueGyms.length} verified gyms near your location!`, 'success');
          } else {
            addToast('No gyms found within 5km. You can type your gym name manually.', 'info');
          }
        } catch (error) {
          addToast('Could not query live map. Switched to suggested gym brands.', 'warning');
          setNearbyGyms([
            { id: 'sim-1', name: "Gold's Gym" },
            { id: 'sim-2', name: 'Planet Fitness' },
            { id: 'sim-3', name: 'Snap Fitness' },
            { id: 'sim-4', name: 'Anytime Fitness' },
            { id: 'sim-5', name: 'Equinox' },
          ]);
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        addToast('Location access denied. Using suggested gym brands.', 'warning');
        setNearbyGyms([
          { id: 'sim-1', name: "Gold's Gym" },
          { id: 'sim-2', name: 'Planet Fitness' },
          { id: 'sim-3', name: 'Snap Fitness' },
          { id: 'sim-4', name: 'Anytime Fitness' },
          { id: 'sim-5', name: 'Equinox' },
        ]);
        setLocationLoading(false);
      }
    );
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!gymId.trim()) {
      addToast('Please specify your gym location.', 'warning');
      return;
    }
    if (!goal) {
      addToast('Please select your fitness goal.', 'warning');
      return;
    }
    if (!experienceLevel) {
      addToast('Please select your experience level.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const response = await api.patch('/api/users/profile', {
        gymId: gymId.trim(),
        goal,
        experienceLevel,
      });

      if (response.data.success) {
        updateUserContext(response.data.user);
        addToast('Profile updated successfully!', 'success');
      }
    } catch (error) {
      addToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading your profile..." />;

  const hasChanges =
    gymId !== (user?.gymId || '') ||
    goal !== (user?.goal || '') ||
    experienceLevel !== (user?.experienceLevel || '');

  return (
    <div className="profile-view animate-fade-in" style={{ maxWidth: '840px', margin: '0 auto' }}>
      <PageHeader
        title="My Athletic Profile"
        description="Manage your gym membership location, targeted fitness goals, and training experience."
        badge={
          user?.gymId && user?.goal ? (
            <span className="badge badge-success">
              <CheckCircle size={12} /> Complete
            </span>
          ) : (
            <span className="badge badge-warning">Setup Incomplete</span>
          )
        }
      />

      <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
        {/* Section 1: Account Identification (Read-only) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Account Identification</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Your unique credentials across the Gym Partner platform
              </p>
            </div>
            <User size={18} color="var(--text-muted)" />
          </div>

          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Username"
                type="text"
                value={user?.username || ''}
                disabled
                helpText="Account usernames cannot be modified"
              />
              <Input
                label="Email Address"
                type="email"
                value={user?.email || ''}
                disabled
                helpText="Associated primary login email"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Gym Location & Discovery */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Gym Location</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                You are exclusively matched with athletes training at the same gym location
              </p>
            </div>
            <MapPin size={18} color="var(--primary)" />
          </div>

          <div className="card-body">
            <div className="form-group mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label" style={{ margin: 0 }}>
                  Selected Gym Name
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={findNearbyGyms}
                  disabled={locationLoading}
                >
                  <MapPin size={13} />
                  {locationLoading ? 'Detecting Nearby Gyms...' : 'Find Real Gyms Near Me (GPS)'}
                </Button>
              </div>

              {nearbyGyms.length > 0 ? (
                <div>
                  <select
                    className="form-select mb-2"
                    value={gymId}
                    onChange={(e) => setGymId(e.target.value)}
                  >
                    <option value="">-- Choose from detected local gyms --</option>
                    {nearbyGyms.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Or type manually below if your specific branch is not listed.
                  </span>
                </div>
              ) : null}

              <div className="mt-2">
                <input
                  list="suggested-gyms"
                  className="form-input"
                  placeholder="e.g. Gold's Gym Downtown, Planet Fitness West, Equinox..."
                  value={gymId}
                  onChange={(e) => setGymId(e.target.value)}
                  required
                />
                <datalist id="suggested-gyms">
                  <option value="Gold's Gym" />
                  <option value="Planet Fitness" />
                  <option value="Crunch Fitness" />
                  <option value="Anytime Fitness" />
                  <option value="Equinox" />
                  <option value="Lifetime Fitness" />
                  <option value="LA Fitness" />
                </datalist>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Primary Fitness Goal */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Fitness Goal</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Helps pair you with partners who share similar training intensity and goals
              </p>
            </div>
            <Dumbbell size={18} color="var(--primary)" />
          </div>

          <div className="card-body">
            <div className="goals-options-grid">
              {GOAL_OPTIONS.map((opt) => {
                const isSelected = goal === opt.value;
                return (
                  <div
                    key={opt.value}
                    className={`profile-option-tile ${isSelected ? 'selected' : ''}`}
                    onClick={() => setGoal(opt.value)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="tile-title">{opt.label}</span>
                      {isSelected && <CheckCircle size={16} color="var(--primary)" />}
                    </div>
                    <span className="tile-desc">{opt.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Training Experience Level */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Experience Level</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Accurate experience levels ensure realistic spotter support and workout pacing
              </p>
            </div>
            <Award size={18} color="var(--primary)" />
          </div>

          <div className="card-body">
            <div className="exp-options-grid">
              {EXP_OPTIONS.map((opt) => {
                const isSelected = experienceLevel === opt.value;
                return (
                  <div
                    key={opt.value}
                    className={`profile-option-tile ${isSelected ? 'selected' : ''}`}
                    onClick={() => setExperienceLevel(opt.value)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="tile-title">{opt.label}</span>
                      {isSelected && <CheckCircle size={16} color="var(--primary)" />}
                    </div>
                    <span className="tile-desc">{opt.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Footer Save Button */}
        <div className="card-footer" style={{ padding: '1.25rem 1.5rem', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {hasChanges ? 'You have unsaved changes' : 'Profile up to date'}
          </span>
          <div className="flex gap-2">
            {hasChanges && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setGymId(user?.gymId || '');
                  setGoal(user?.goal || '');
                  setExperienceLevel(user?.experienceLevel || '');
                }}
              >
                Reset
              </Button>
            )}
            <Button type="submit" variant="primary" disabled={saving || !hasChanges}>
              {saving ? 'Saving changes...' : 'Save Profile Changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
