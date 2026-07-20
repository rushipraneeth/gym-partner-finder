import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import Loader from '../components/Loader';

const ALL_MUSCLES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Core', 'Cardio', 'Full Body'];

const LookingToday = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [isLookingToday, setIsLookingToday] = useState(false);
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:30');
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    checkStatusAndFetchMatches();
  }, []);

  const checkStatusAndFetchMatches = async () => {
    try {
      const res = await api.get('/api/today/matches');
      if (res.data.success) {
        setIsLookingToday(true);
        setTodayMatches(res.data.todayMatches || []);
        // NOTE: The backend API /api/today/matches returns matches if we are activated.
      }
    } catch (error) {
      if (error.message === 'Please activate Looking Today first.') {
        setIsLookingToday(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      await api.post('/api/today/activate');
      setIsLookingToday(true);
      addToast('Activated Looking Today!', 'success');
      checkStatusAndFetchMatches();
    } catch (error) {
      addToast(error.message || 'Failed to activate', 'error');
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await Promise.all([
        api.put('/api/today/workout', { muscleGroups: selectedMuscles }),
        api.put('/api/today/time', { startTime, endTime })
      ]);
      addToast('Today\'s workout details updated!', 'success');
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      checkStatusAndFetchMatches(); // Refresh matches based on new time/muscles
    } catch (error) {
      addToast('Failed to update details', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const sendRequest = async (receiverId) => {
    try {
      const res = await api.post('/api/partner-requests', { receiverId });
      if (res.data.success) {
        addToast('Partner request sent!', 'success');
      }
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Failed to send request', 'error');
    }
  };

  const toggleMuscle = (muscle) => {
    if (selectedMuscles.includes(muscle)) {
      setSelectedMuscles(selectedMuscles.filter(m => m !== muscle));
    } else {
      setSelectedMuscles([...selectedMuscles, muscle]);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="looking-today-page animate-fade-in">
      <h1 className="mb-4">Looking for Partner Today</h1>
      
      {!isLookingToday ? (
        <div className="glass-card text-center py-5 border-warning" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚡</div>
          <h2 className="mb-2">Find a Partner for Today</h2>
          <p className="text-secondary mb-4">Activate this feature to find other users at your gym who are also looking for a partner today.</p>
          <Button variant="primary" size="lg" onClick={handleActivate}>
            Activate Looking Today
          </Button>
        </div>
      ) : (
        <div className="flex-col gap-4">
          <div className="glass-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="m-0 text-primary">Status: Active</h2>
              <span className="badge-success">Looking Today</span>
            </div>
            
            <form onSubmit={handleUpdateDetails}>
              <h3 className="mb-2">Update Today's Workout Details</h3>
              <div className="flex gap-2">
                <Input label="Start Time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                <Input label="End Time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
              </div>
              <div className="form-group mt-2">
                <label className="form-label">Muscle Groups</label>
                <div className="muscle-grid">
                  {ALL_MUSCLES.map(muscle => (
                    <div 
                      key={muscle} 
                      className={`muscle-chip ${selectedMuscles.includes(muscle) ? 'selected' : ''}`}
                      onClick={() => toggleMuscle(muscle)}
                    >
                      {muscle}
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" variant={updateSuccess ? "primary" : "secondary"} className="mt-4" disabled={updating}>
                {updating ? 'Updating...' : updateSuccess ? '✓ Updated Successfully!' : 'Update Details'}
              </Button>
            </form>
          </div>

          <div>
            <h2 className="mb-4 mt-4">Today's Matches ({todayMatches.length})</h2>
            {todayMatches.length === 0 ? (
              <p className="text-secondary">No one else at your gym is looking today with a matching time slot (at least 30 min overlap).</p>
            ) : (
              <div className="matches-grid">
                {todayMatches.map((match) => (
                  <div key={match.candidate._id} className="glass-card match-card">
                    <div className="match-card-header">
                      <div className="match-avatar">{match.candidate.username.charAt(0).toUpperCase()}</div>
                      <div className="match-info">
                        <h3>{match.candidate.username}</h3>
                        <span className="text-secondary text-sm">
                          {match.candidate.startTime} - {match.candidate.endTime}
                        </span>
                      </div>
                    </div>
                    <div className="match-card-body mt-4">
                      <p className="text-sm"><strong>Overlap:</strong> {match.overlapMinutes} mins</p>
                      <p className="text-sm"><strong>Common Workout:</strong> {match.commonWorkouts.join(', ') || 'None'}</p>
                      <div className="mt-4 flex">
                        <Button variant="primary" className="w-100" onClick={() => sendRequest(match.candidate._id)}>
                          Workout Together (Send Request)
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LookingToday;
