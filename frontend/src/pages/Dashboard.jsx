import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/dashboard/StatCard';
import UserAvatar from '../components/common/UserAvatar';
import Button from '../components/Button';
import Loader from '../components/Loader';
import EmptyState from '../components/common/EmptyState';
import {
  Users,
  Inbox,
  UserCheck,
  Zap,
  Calendar,
  Clock,
  Dumbbell,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Plus,
} from '../components/common/Icons';
import './Dashboard.css';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isLookingToday, setIsLookingToday] = useState(false);
  const [workouts, setWorkouts] = useState([]);

  const currentDayName = DAYS_OF_WEEK[new Date().getDay()];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [matchesRes, reqsRes, connsRes, todayRes, profileRes] = await Promise.all([
          api.get('/api/matches').catch(() => null),
          api.get('/api/partner-requests/received').catch(() => null),
          api.get('/api/partner-requests/connections').catch(() => null),
          api.get('/api/today/matches').catch(() => null),
          api.get('/api/users/matching-profile').catch(() => null),
        ]);

        if (matchesRes?.data?.success) {
          setMatches(matchesRes.data.eligibleCandidates || []);
        }

        if (reqsRes?.data?.success) {
          const pending = (reqsRes.data.receivedRequests || []).filter((r) => r.status === 'pending');
          setPendingRequests(pending);
        }

        if (connsRes?.data?.success) {
          setConnections(connsRes.data.connections || []);
        }

        if (todayRes?.data?.success) {
          setIsLookingToday(true);
        }

        if (profileRes?.data?.success) {
          setWorkouts(profileRes.data.matchingProfile?.workoutSchedule || []);
        }
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Calculate profile completion
  const profileSteps = [
    { label: 'Gym location chosen', done: !!user?.gymId },
    { label: 'Fitness goal specified', done: !!user?.goal },
    { label: 'Experience level set', done: !!user?.experienceLevel },
    { label: 'Weekly schedule added', done: workouts.length > 0 },
  ];
  const completedSteps = profileSteps.filter((s) => s.done).length;
  const profilePercentage = Math.round((completedSteps / profileSteps.length) * 100);

  // Find today's workout
  const todayWorkout = workouts.find((w) => w.day === currentDayName);

  const sendQuickRequest = async (candidateId) => {
    try {
      const res = await api.post('/api/partner-requests', { receiverId: candidateId });
      if (res.data.success) {
        addToast('Partner request sent successfully!', 'success');
        // Filter out from immediate spotlight
        setMatches((prev) => prev.filter((m) => m.candidate._id !== candidateId));
      }
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Failed to send request', 'error');
    }
  };

  if (loading) {
    return <Loader text="Loading your dashboard..." />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title={`${getGreeting()}, ${user?.username || 'Athlete'}`}
        description={`Gym: ${user?.gymId || 'No gym selected yet'} • Focus: ${user?.goal || 'General Fitness'}`}
        actions={
          <div className="flex gap-2">
            <Button
              variant={isLookingToday ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => navigate('/looking-today')}
            >
              <Zap size={14} />
              {isLookingToday ? 'Looking Today (Active)' : 'Find Partner for Today'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/schedule')}>
              <Calendar size={14} />
              Manage Split
            </Button>
          </div>
        }
      />

      {/* Profile Completion Callout (if incomplete) */}
      {profilePercentage < 100 && (
        <div className="card profile-completion-card mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="completion-ring-icon">
                <AlertCircle size={20} color="var(--primary)" />
              </div>
              <div>
                <h3 className="completion-title">
                  Complete your profile ({profilePercentage}%)
                </h3>
                <p className="completion-subtitle">
                  Finish setting up your gym and workout routine to unlock higher-accuracy partner matches.
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate(workouts.length === 0 ? '/schedule' : '/profile')}>
              Continue setup <ArrowRight size={14} />
            </Button>
          </div>
          <div className="completion-progress-track mt-3">
            <div
              className="completion-progress-fill"
              style={{ width: `${profilePercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Key Metric Stat Cards */}
      <div className="dashboard-stats-grid mb-6">
        <StatCard
          icon={Users}
          title="Eligible Matches"
          value={matches.length}
          subtitle="Partners matching >60% routine"
          linkTo="/matches"
          linkLabel="Explore matches"
          color="primary"
        />
        <StatCard
          icon={Inbox}
          title="Pending Requests"
          value={pendingRequests.length}
          subtitle={pendingRequests.length > 0 ? 'Requires your review' : 'No pending invites'}
          badge={
            pendingRequests.length > 0 ? (
              <span className="badge badge-warning">Action needed</span>
            ) : null
          }
          linkTo="/requests"
          linkLabel="View requests"
          color="warning"
        />
        <StatCard
          icon={UserCheck}
          title="Active Connections"
          value={connections.length}
          subtitle="Confirmed gym buddies"
          linkTo="/connections"
          linkLabel="Open directory"
          color="success"
        />
        <StatCard
          icon={Zap}
          title="Same-Day Status"
          value={isLookingToday ? 'Active' : 'Inactive'}
          subtitle={isLookingToday ? 'Visible in today’s pool' : 'Activate to train today'}
          badge={
            <span className={`badge ${isLookingToday ? 'badge-success' : 'badge-neutral'}`}>
              {isLookingToday ? 'Looking Today' : 'Idle'}
            </span>
          }
          linkTo="/looking-today"
          linkLabel="Manage availability"
          color="info"
        />
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="dashboard-content-grid">
        {/* Left Column: Weekly Activity & Recommended Matches */}
        <div className="dashboard-main-col flex flex-col gap-6">
          {/* Weekly Workout Split Preview */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Weekly Workout Routine</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {workouts.length} scheduled workout days this week
                </p>
              </div>
              <Link to="/schedule" className="btn btn-ghost btn-sm">
                Full Calendar <ArrowRight size={13} />
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="dashboard-weekly-strip">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                  (day) => {
                    const scheduled = workouts.find((w) => w.day === day);
                    const isToday = currentDayName === day;

                    return (
                      <div
                        key={day}
                        className={`weekly-day-cell ${isToday ? 'is-today' : ''} ${scheduled ? 'has-workout' : 'is-rest'}`}
                      >
                        <span className="day-name">{day.slice(0, 3)}</span>
                        {scheduled ? (
                          <>
                            <div className="day-status-indicator active" />
                            <span className="day-time">{scheduled.startTime}</span>
                            <span className="day-muscles truncate">
                              {scheduled.muscleGroups.join(', ')}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="day-status-indicator rest" />
                            <span className="day-rest-label">Rest</span>
                          </>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Recommended Matches Spotlight */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Recommended Partners</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Top gym partners at {user?.gymId || 'your gym'} with compatible schedules
                </p>
              </div>
              <Link to="/matches" className="btn btn-ghost btn-sm">
                View all ({matches.length}) <ArrowRight size={13} />
              </Link>
            </div>
            <div className="card-body">
              {matches.length === 0 ? (
                <EmptyState
                  compact
                  icon={Users}
                  title="No eligible matches right now"
                  description={
                    workouts.length === 0
                      ? 'Add your weekly workout schedule so our matchmaking algorithm can find partners for you.'
                      : 'There are no members in your gym with >60% schedule overlap right now. Check back soon!'
                  }
                  action={
                    workouts.length === 0 ? (
                      <Button variant="primary" size="sm" onClick={() => navigate('/schedule')}>
                        <Plus size={14} /> Configure Weekly Split
                      </Button>
                    ) : null
                  }
                />
              ) : (
                <div className="recommended-matches-list flex flex-col gap-3">
                  {matches.slice(0, 3).map((match) => {
                    const { candidate, matchPercentage, scoreBreakdown, matchReasons } = match;
                    return (
                      <div key={candidate._id} className="recommended-match-row">
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar name={candidate.username} size="md" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="match-name truncate">{candidate.username}</h4>
                              <span className="badge badge-primary">{matchPercentage} Match</span>
                            </div>
                            <p className="match-meta truncate">
                              {candidate.goal || 'Fitness'} • {candidate.experienceLevel || 'Intermediate'}
                            </p>
                            <p className="match-reason-preview truncate">
                              {matchReasons?.[0] || 'Compatible workout hours'}
                            </p>
                          </div>
                        </div>

                        <div className="match-actions-col">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => sendQuickRequest(candidate._id)}
                          >
                            Connect
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/matches')}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Today's Focus & Quick Actions */}
        <div className="dashboard-side-col flex flex-col gap-6">
          {/* Today's Workout Focus Card */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Today's Routine ({currentDayName})</h3>
              <span className={`badge ${todayWorkout ? 'badge-primary' : 'badge-neutral'}`}>
                {todayWorkout ? 'Scheduled' : 'Rest Day'}
              </span>
            </div>
            <div className="card-body">
              {todayWorkout ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                      {todayWorkout.startTime} - {todayWorkout.endTime}
                    </span>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <span className="form-label" style={{ marginBottom: '0.375rem' }}>
                      Targeted Muscles:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {todayWorkout.muscleGroups.map((group) => (
                        <span key={group} className="badge badge-neutral">
                          <Dumbbell size={11} /> {group}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate('/looking-today')}
                  >
                    <Zap size={14} /> Find Partner For This Session
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    No routine scheduled for today. Enjoy your rest or activate Looking Today for a spontaneous session.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/schedule')}>
                    Edit Weekly Routine
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Quick Actions</h3>
            </div>
            <div className="card-body p-2">
              <nav className="quick-actions-nav">
                <Link to="/looking-today" className="quick-action-row">
                  <div className="quick-action-icon bg-info">
                    <Zap size={16} color="var(--info)" />
                  </div>
                  <div className="quick-action-text">
                    <span className="title">Looking Today Mode</span>
                    <span className="desc">Match with anyone training today</span>
                  </div>
                  <ArrowRight size={14} className="arrow" />
                </Link>

                <Link to="/matches" className="quick-action-row">
                  <div className="quick-action-icon bg-primary">
                    <Users size={16} color="var(--primary)" />
                  </div>
                  <div className="quick-action-text">
                    <span className="title">Find Partners</span>
                    <span className="desc">Filter candidates by split & overlap</span>
                  </div>
                  <ArrowRight size={14} className="arrow" />
                </Link>

                <Link to="/schedule" className="quick-action-row">
                  <div className="quick-action-icon bg-success">
                    <Calendar size={16} color="var(--success)" />
                  </div>
                  <div className="quick-action-text">
                    <span className="title">Workout Calendar</span>
                    <span className="desc">Update weekly training split</span>
                  </div>
                  <ArrowRight size={14} className="arrow" />
                </Link>

                <Link to="/privacy-settings" className="quick-action-row">
                  <div className="quick-action-icon bg-warning">
                    <Shield size={16} color="var(--warning)" />
                  </div>
                  <div className="quick-action-text">
                    <span className="title">Privacy & Visibility</span>
                    <span className="desc">Control who sees your times & profile</span>
                  </div>
                  <ArrowRight size={14} className="arrow" />
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
