import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import DashboardHeader from '../components/DashboardHeader';
import './WorkoutSchedule.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const ALL_MUSCLES = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Core', 'Cardio', 'Full Body'];

const WorkoutSchedule = () => {
  const { addToast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  
  // Form state
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:30');
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await api.get('/api/users/matching-profile');
      if (res.data.success) {
        setSchedules(res.data.matchingProfile.workoutSchedule || []);
      }
    } catch (error) {
      if (error.message !== 'Matching profile is incomplete') {
        console.error('Error fetching schedule', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getScheduleForDay = (day) => {
    return schedules.find(s => s.day === day);
  };

  const openAddModal = (day) => {
    setSelectedDay(day);
    setStartTime('17:00');
    setEndTime('18:30');
    setSelectedMuscles([]);
    setIsModalOpen(true);
  };

  const toggleMuscle = (muscle) => {
    if (selectedMuscles.includes(muscle)) {
      setSelectedMuscles(selectedMuscles.filter(m => m !== muscle));
    } else {
      setSelectedMuscles([...selectedMuscles, muscle]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedMuscles.length === 0) {
      addToast('Please select at least one muscle group', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/api/workouts', {
        day: selectedDay,
        startTime,
        endTime,
        muscleGroups: selectedMuscles
      });
      if (res.data.success) {
        addToast(`Workout for ${selectedDay} added!`, 'success');
        setSchedules([...schedules, res.data.workout]);
        setIsModalOpen(false);
      }
    } catch (error) {
      addToast(error.message || 'Failed to add workout', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="schedule-page animate-fade-in pb-10">
      <DashboardHeader />
      <div className="mb-4">
        <h1>Weekly Workout Schedule</h1>
        <p className="text-secondary">Plan your week to find partners with similar routines.</p>
        <div className="alert alert-info mt-2">
          <strong>Note:</strong> Workouts cannot be edited or deleted once added due to system limitations.
        </div>
      </div>

      <div className="timetable-grid">
        {DAYS.map(day => {
          const schedule = getScheduleForDay(day);
          return (
            <div key={day} className={`glass-card day-card ${schedule ? 'configured' : 'empty'}`}>
              <div className="day-header">
                <h3>{day}</h3>
                {schedule && <span className="badge-success">Configured</span>}
              </div>
              
              <div className="day-body">
                {schedule ? (
                  <>
                    <div className="time-block">
                      <span className="icon">🕒</span> {schedule.startTime} - {schedule.endTime}
                    </div>
                    <div className="muscle-tags">
                      {schedule.muscleGroups.map(m => (
                        <span key={m} className="tag">{m}</span>
                      ))}
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="mt-4 w-100" 
                      onClick={() => addToast('Editing is not supported by the current system', 'warning')}
                    >
                      Locked
                    </Button>
                  </>
                ) : (
                  <div className="empty-state">
                    <p className="text-secondary">Rest day or unconfigured.</p>
                    <Button variant="primary" size="sm" onClick={() => openAddModal(day)}>
                      + Add Workout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add Workout - ${selectedDay}`}>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <Input 
              label="Start Time" 
              type="time" 
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)} 
              required 
            />
            <Input 
              label="End Time" 
              type="time" 
              value={endTime} 
              onChange={(e) => setEndTime(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Target Muscle Groups</label>
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
          
          <Button type="submit" variant="primary" className="w-100 mt-4" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Workout'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default WorkoutSchedule;
