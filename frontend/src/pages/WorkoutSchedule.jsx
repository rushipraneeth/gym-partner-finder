import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  Calendar,
  Clock,
  Dumbbell,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
} from '../components/common/Icons';
import './WorkoutSchedule.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
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

const WorkoutSchedule = () => {
  const { addToast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'add' or 'edit'
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:30');
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm Dialog State
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      // First try /api/workouts, fallback to matching-profile if needed
      const res = await api.get('/api/workouts').catch(async () => {
        return await api.get('/api/users/matching-profile').catch(() => null);
      });

      if (res?.data?.success) {
        const list = res.data.workouts || res.data.matchingProfile?.workoutSchedule || [];
        setSchedules(list);
      }
    } catch (err) {
      console.error('Error fetching schedules', err);
    } finally {
      setLoading(false);
    }
  };

  const getScheduleForDay = (day) => {
    return schedules.find((s) => s.day === day);
  };

  const openAddModal = (day) => {
    setModalMode('add');
    setSelectedDay(day);
    setSelectedWorkoutId(null);
    setStartTime('17:00');
    setEndTime('18:30');
    setSelectedMuscles(['Chest', 'Triceps']);
  };

  const openEditModal = (workout) => {
    setModalMode('edit');
    setSelectedDay(workout.day);
    setSelectedWorkoutId(workout._id);
    setStartTime(workout.startTime || '17:00');
    setEndTime(workout.endTime || '18:30');
    setSelectedMuscles(workout.muscleGroups || []);
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedDay('');
    setSelectedWorkoutId(null);
  };

  const toggleMuscle = (muscle) => {
    if (selectedMuscles.includes(muscle)) {
      setSelectedMuscles(selectedMuscles.filter((m) => m !== muscle));
    } else {
      setSelectedMuscles([...selectedMuscles, muscle]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedMuscles.length === 0) {
      addToast('Please select at least one targeted muscle group', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        const res = await api.post('/api/workouts', {
          day: selectedDay,
          startTime,
          endTime,
          muscleGroups: selectedMuscles,
        });

        if (res.data.success) {
          addToast(`Workout for ${selectedDay} added successfully!`, 'success');
          setSchedules((prev) => [...prev, res.data.workout]);
          closeModal();
        }
      } else if (modalMode === 'edit') {
        const res = await api.patch(`/api/workouts/${selectedWorkoutId}`, {
          day: selectedDay,
          startTime,
          endTime,
          muscleGroups: selectedMuscles,
        });

        if (res.data.success) {
          addToast(`Workout for ${selectedDay} updated!`, 'success');
          setSchedules((prev) =>
            prev.map((w) => (w._id === selectedWorkoutId ? res.data.workout : w))
          );
          closeModal();
        }
      }
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkout = async () => {
    if (!workoutToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/api/workouts/${workoutToDelete._id}`);
      if (res.data.success) {
        addToast(`Workout for ${workoutToDelete.day} removed. Now marked as rest day.`, 'info');
        setSchedules((prev) => prev.filter((w) => w._id !== workoutToDelete._id));
        setWorkoutToDelete(null);
      }
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Failed to delete workout', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader text="Loading workout calendar..." />;

  const totalWorkoutDays = schedules.length;
  const restDaysCount = 7 - totalWorkoutDays;

  return (
    <div className="schedule-view animate-fade-in">
      <PageHeader
        title="Weekly Workout Routine"
        description="Plan your standard weekly workout split (Monday - Sunday). Partners are matched based on identical training days and overlapping hours."
        badge={
          <span className="badge badge-primary">
            {totalWorkoutDays} Training Days • {restDaysCount} Rest Days
          </span>
        }
      />

      {/* Timetable Grid */}
      <div className="weekly-calendar-grid">
        {DAYS.map((day) => {
          const schedule = getScheduleForDay(day);

          return (
            <div
              key={day}
              className={`card day-routine-card ${schedule ? 'configured' : 'rest-day'}`}
            >
              <div className="day-routine-header">
                <div>
                  <h3 className="day-title">{day}</h3>
                  <span className={`badge ${schedule ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.6875rem' }}>
                    {schedule ? 'Training Day' : 'Rest Day'}
                  </span>
                </div>

                {schedule && (
                  <div className="day-actions">
                    <button
                      className="icon-action-btn"
                      onClick={() => openEditModal(schedule)}
                      title="Edit workout"
                      aria-label={`Edit ${day} workout`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="icon-action-btn danger"
                      onClick={() => setWorkoutToDelete(schedule)}
                      title="Remove workout"
                      aria-label={`Remove ${day} workout`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="day-routine-body">
                {schedule ? (
                  <>
                    <div className="time-pill mb-3">
                      <Clock size={13} color="var(--primary)" />
                      <span>{schedule.startTime} - {schedule.endTime}</span>
                    </div>

                    <div className="muscles-list">
                      <span className="muscles-title">Target Muscles:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {schedule.muscleGroups.map((muscle) => (
                          <span key={muscle} className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                            <Dumbbell size={10} /> {muscle}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rest-day-content">
                    <p className="rest-text">Scheduled recovery day.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAddModal(day)}
                    >
                      <Plus size={14} /> Add Workout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Workout Modal */}
      {modalMode && (
        <Modal
          isOpen={!!modalMode}
          onClose={closeModal}
          title={modalMode === 'add' ? `Add Routine — ${selectedDay}` : `Edit Routine — ${selectedDay}`}
          subtitle="Configure hours and target muscle groups"
          maxWidth="480px"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
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

            <div className="form-group mb-5">
              <label className="form-label">
                Target Muscle Groups
                <span className="form-label-hint">Select all you plan to train</span>
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

            <div className="modal-actions-bar">
              <Button variant="secondary" type="button" onClick={closeModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : modalMode === 'add' ? 'Add to Calendar' : 'Update Routine'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!workoutToDelete}
        onClose={() => setWorkoutToDelete(null)}
        onConfirm={handleDeleteWorkout}
        title={`Remove workout for ${workoutToDelete?.day}?`}
        message={`This will clear your ${workoutToDelete?.day} schedule and mark it as a rest day.`}
        confirmText="Remove Workout"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default WorkoutSchedule;
