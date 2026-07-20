import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Loader from '../components/Loader';

const Profile = () => {
  const { user, updateUserContext } = useAuth();
  const { addToast } = useToast();
  
  const [gymId, setGymId] = useState(user?.gymId || '');
  const [goal, setGoal] = useState(user?.goal || '');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || '');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nearbyGyms, setNearbyGyms] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!user?.gymId);
  const [isUpdated, setIsUpdated] = useState(false);

  // Sync state if user loads later
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
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const query = `[out:json];node(around:5000,${latitude},${longitude})["leisure"="fitness_centre"];out;`;
        const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        const gyms = data.elements
          .filter(el => el.tags && el.tags.name)
          .map(el => ({
            id: `osm-${el.id}`,
            name: el.tags.name
          }));
          
        if (gyms.length > 0) {
          setNearbyGyms(gyms);
          addToast(`Found ${gyms.length} real gyms near you!`, 'success');
        } else {
          addToast('No gyms found within 5km of your location.', 'info');
        }
      } catch (error) {
        addToast('Failed to fetch nearby gyms. Check network.', 'error');
      } finally {
        setLocationLoading(false);
      }
    }, (error) => {
      addToast('Location access denied or failed.', 'error');
      setLocationLoading(false);
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // API expects: gymId, goal, experienceLevel
      const response = await api.patch('/api/users/profile', {
        gymId,
        goal,
        experienceLevel
      });
      if (response.data.success) {
        updateUserContext(response.data.user);
        addToast('Profile updated successfully', 'success');
        setIsEditing(false);
        setIsUpdated(true);
        setTimeout(() => setIsUpdated(false), 3000);
      }
    } catch (error) {
      addToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="profile-page animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="mb-4">My Profile</h1>
      
      <div className="glass-card">
        <form onSubmit={handleUpdateProfile}>
          
          <div className="form-group mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h3 className="mb-4">Account Information</h3>
            <Input label="Username (Read-only)" type="text" value={user?.username || ''} disabled />
            <Input label="Email (Read-only)" type="email" value={user?.email || ''} disabled />
            <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Username and email cannot be changed at this time.</p>
          </div>

          <div className="form-group mb-4">
            <h3 className="mb-4">Fitness Profile</h3>
            
            <div className="form-group">
              <label className="form-label">Select Gym</label>
              <div className="flex gap-2 mb-2">
                {isEditing && (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    onClick={findNearbyGyms}
                    disabled={locationLoading}
                  >
                    {locationLoading ? 'Finding Gyms...' : '📍 Use Live Location'}
                  </Button>
                )}
              </div>
              <input 
                list="gym-options"
                className="form-input" 
                value={gymId} 
                onChange={(e) => setGymId(e.target.value)}
                required
                disabled={!isEditing}
                placeholder="Type or select your gym..."
              />
              <datalist id="gym-options">
                {nearbyGyms.map(gym => (
                  <option key={gym.id} value={gym.name} />
                ))}
                <option value="Gold's Gym (New York)" />
                <option value="Planet Fitness (New York)" />
                <option value="Crunch Fitness (New York)" />
                <option value="Anytime Fitness (LA)" />
                <option value="Equinox (LA)" />
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label">Fitness Goal</label>
              <select 
                className="form-input" 
                value={goal} 
                onChange={(e) => setGoal(e.target.value)}
                required
                disabled={!isEditing}
              >
                <option value="">-- Select Goal --</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Endurance">Endurance Training</option>
                <option value="General Fitness">General Fitness</option>
                <option value="Powerlifting">Powerlifting</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select 
                className="form-input" 
                value={experienceLevel} 
                onChange={(e) => setExperienceLevel(e.target.value)}
                required
                disabled={!isEditing}
              >
                <option value="">-- Select Level --</option>
                <option value="Beginner">Beginner (0-1 years)</option>
                <option value="Intermediate">Intermediate (1-3 years)</option>
                <option value="Advanced">Advanced (3+ years)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 items-center mt-4">
            {isEditing ? (
              <>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={saving || (gymId === user?.gymId && goal === user?.goal && experienceLevel === user?.experienceLevel)}
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
                {user?.gymId && (
                  <Button type="button" variant="secondary" onClick={() => {
                    setIsEditing(false);
                    setGymId(user.gymId);
                    setGoal(user.goal);
                    setExperienceLevel(user.experienceLevel);
                  }}>
                    Cancel
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button type="button" variant="primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
                {isUpdated && <span className="text-success font-weight-bold" style={{ color: '#10b981' }}>✓ Profile Updated!</span>}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
