import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import MatchCard from '../components/matching/MatchCard';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import EmptyState from '../components/common/EmptyState';
import UserAvatar from '../components/common/UserAvatar';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Calendar,
  Dumbbell,
  Award,
  Sliders,
  Plus,
} from '../components/common/Icons';
import './Matches.css';

const Matches = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') === 'all' ? 'all' : 'recommended';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSchedule, setHasSchedule] = useState(false);

  // Relationships
  const [connections, setConnections] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState('ALL');
  const [expFilter, setExpFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('score'); // 'score', 'name'

  // Modal
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    const tabFromUrl = queryParams.get('tab') === 'all' ? 'all' : 'recommended';
    setActiveTab(tabFromUrl);
  }, [location.search]);

  useEffect(() => {
    loadAllMatchData();
  }, []);

  const loadAllMatchData = async () => {
    setLoading(true);
    try {
      const [matchesRes, profileRes, connRes, sentRes, recRes] = await Promise.all([
        api.get('/api/matches').catch(() => null),
        api.get('/api/users/matching-profile').catch(() => null),
        api.get('/api/partner-requests/connections').catch(() => null),
        api.get('/api/partner-requests/sent').catch(() => null),
        api.get('/api/partner-requests/received').catch(() => null),
      ]);

      if (matchesRes?.data?.success) {
        setMatches(matchesRes.data.eligibleCandidates || []);
      }

      if (profileRes?.data?.success && profileRes.data.matchingProfile?.workoutSchedule?.length > 0) {
        setHasSchedule(true);
      }

      if (connRes?.data?.success) setConnections(connRes.data.connections || []);
      if (sentRes?.data?.success) setSentRequests(sentRes.data.sentRequests || []);
      if (recRes?.data?.success) setReceivedRequests(recRes.data.receivedRequests || []);
    } catch (err) {
      console.error('Failed to load match data', err);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (receiverId) => {
    try {
      const res = await api.post('/api/partner-requests', { receiverId });
      if (res.data.success) {
        addToast('Partner request sent successfully!', 'success');
        // Refresh relationships
        const sentRes = await api.get('/api/partner-requests/sent');
        if (sentRes.data.success) setSentRequests(sentRes.data.sentRequests);
      }
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Failed to send request', 'error');
    }
  };

  const getRelationshipStatus = (candidateId) => {
    const isConnected = connections.some(
      (c) => c.user1?._id === candidateId || c.user2?._id === candidateId
    );
    if (isConnected) return 'connected';

    const isSent = sentRequests.some(
      (r) => (r.receiverId?._id === candidateId || r.receiverId === candidateId) && r.status === 'pending'
    );
    if (isSent) return 'sent';

    const isReceived = receivedRequests.some(
      (r) => (r.senderId?._id === candidateId || r.senderId === candidateId) && r.status === 'pending'
    );
    if (isReceived) return 'received';

    return 'none';
  };

  // Filter and Sort matches
  const filteredMatches = useMemo(() => {
    return matches
      .filter((m) => {
        const username = (m.candidate?.username || '').toLowerCase();
        const matchesQuery = username.includes(searchQuery.toLowerCase().trim());
        const matchesGoal = goalFilter === 'ALL' || m.candidate?.goal === goalFilter;
        const matchesExp = expFilter === 'ALL' || m.candidate?.experienceLevel === expFilter;
        return matchesQuery && matchesGoal && matchesExp;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return (a.candidate?.username || '').localeCompare(b.candidate?.username || '');
        }
        // default by score
        const scoreA = parseFloat(a.matchPercentage) || 0;
        const scoreB = parseFloat(b.matchPercentage) || 0;
        return scoreB - scoreA;
      });
  }, [matches, searchQuery, goalFilter, expFilter, sortBy]);

  if (loading) {
    return <Loader text="Calculating partner compatibility..." />;
  }

  return (
    <div className="matches-view animate-fade-in">
      <PageHeader
        title="Find Workout Partners"
        description={`Gym members at ${user?.gymId || 'your gym'} with overlapping weekly training schedules (>60% compatibility threshold).`}
        badge={<span className="badge badge-primary">{matches.length} Eligible</span>}
      />

      {/* Tabs Switcher */}
      <div className="tabs-header-bar mb-5">
        <div className="segmented-control">
          <button
            className={`segmented-btn ${activeTab === 'recommended' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('recommended');
              navigate('/matches');
            }}
          >
            <Award size={15} />
            Recommended Matches ({matches.length})
          </button>
          <button
            className={`segmented-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('all');
              navigate('/matches?tab=all');
            }}
          >
            <Users size={15} />
            Discover All Candidates
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card filter-bar-card mb-6">
        <div className="filter-bar-content">
          <div className="search-input-box">
            <Input
              icon={Search}
              placeholder="Search partner by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>

          <div className="filter-dropdowns-group">
            <div className="filter-item">
              <label className="filter-label">Goal</label>
              <select
                className="form-select filter-select"
                value={goalFilter}
                onChange={(e) => setGoalFilter(e.target.value)}
              >
                <option value="ALL">All Fitness Goals</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Endurance">Endurance Training</option>
                <option value="General Fitness">General Fitness</option>
                <option value="Powerlifting">Powerlifting</option>
              </select>
            </div>

            <div className="filter-item">
              <label className="filter-label">Experience</label>
              <select
                className="form-select filter-select"
                value={expFilter}
                onChange={(e) => setExpFilter(e.target.value)}
              >
                <option value="ALL">All Experience Levels</option>
                <option value="Beginner">Beginner (0-1 yrs)</option>
                <option value="Intermediate">Intermediate (1-3 yrs)</option>
                <option value="Advanced">Advanced (3+ yrs)</option>
              </select>
            </div>

            <div className="filter-item">
              <label className="filter-label">Sort By</label>
              <select
                className="form-select filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="score">Highest Match %</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Match Cards Grid or Empty State */}
      {!hasSchedule ? (
        <EmptyState
          icon={Calendar}
          title="Setup your Weekly Schedule first"
          description="Our algorithm calculates compatibility by comparing your training days, hours, and targeted muscle splits against other gym members."
          action={
            <div className="flex gap-3">
              <Button variant="primary" onClick={() => navigate('/schedule')}>
                <Plus size={15} /> Configure Routine
              </Button>
              <Button variant="outline" onClick={() => navigate('/profile')}>
                Update Profile
              </Button>
            </div>
          }
        />
      ) : filteredMatches.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchQuery || goalFilter !== 'ALL' || expFilter !== 'ALL' ? 'No candidates match your filters' : 'No matching gym partners found'}
          description={
            searchQuery || goalFilter !== 'ALL' || expFilter !== 'ALL'
              ? 'Try clearing your search query or adjusting your filters to see more members.'
              : `There are currently no members at ${user?.gymId || 'your gym'} with >60% schedule overlap. Try activating Looking Today to connect with anyone training today!`
          }
          action={
            searchQuery || goalFilter !== 'ALL' || expFilter !== 'ALL' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setGoalFilter('ALL');
                  setExpFilter('ALL');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => navigate('/looking-today')}>
                Check Today's Partner Pool
              </Button>
            )
          }
        />
      ) : (
        <div className="matches-cards-grid">
          {filteredMatches.map((matchData) => (
            <MatchCard
              key={matchData.candidate._id}
              matchData={matchData}
              relationshipStatus={getRelationshipStatus(matchData.candidate._id)}
              onOpenDetails={() => setSelectedMatch(matchData)}
              onSendRequest={sendRequest}
              onReviewRequest={() => navigate('/requests')}
            />
          ))}
        </div>
      )}

      {/* Detailed Match Breakdown Modal */}
      {selectedMatch && (
        <Modal
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          title={`Match Analysis: ${selectedMatch.candidate.username}`}
          subtitle={`Gym: ${selectedMatch.candidate.gymId || 'Same Gym'}`}
          maxWidth="560px"
        >
          <div className="match-analysis-dialog">
            {/* Top Score Banner */}
            <div className="analysis-score-banner mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="banner-sub">Overall Compatibility</span>
                  <h2 className="banner-score text-primary">{selectedMatch.matchPercentage} Match</h2>
                </div>
                <UserAvatar name={selectedMatch.candidate.username} size="lg" />
              </div>
            </div>

            {/* 3 Metric Breakdown Cells */}
            <div className="analysis-breakdown-row mb-4">
              <div className="breakdown-card">
                <span className="val">{selectedMatch.scoreBreakdown?.timeScore || '0%'}</span>
                <span className="lbl">Time Overlap</span>
              </div>
              <div className="breakdown-card">
                <span className="val">{selectedMatch.scoreBreakdown?.dayScore || '0%'}</span>
                <span className="lbl">Days Overlap</span>
              </div>
              <div className="breakdown-card">
                <span className="val">{selectedMatch.scoreBreakdown?.workoutScore || '0%'}</span>
                <span className="lbl">Muscle Split</span>
              </div>
            </div>

            {/* Natural Language Match Reasons */}
            <div className="reasons-section mb-4">
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.625rem' }}>
                Why you match:
              </h4>
              <div className="reasons-list">
                {selectedMatch.matchReasons?.map((reason, index) => (
                  <div key={index} className="reason-item">
                    <CheckCircle size={16} color="var(--success)" className="flex-shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Schedule Details */}
            {selectedMatch.schedule && selectedMatch.schedule.length > 0 && (
              <div className="candidate-schedule-section mb-5">
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.625rem' }}>
                  Weekly Training Days:
                </h4>
                <div className="schedule-preview-table">
                  {selectedMatch.schedule.map((slot) => (
                    <div key={slot.day} className="slot-row">
                      <span className="slot-day">{slot.day}</span>
                      {slot.startTime && slot.endTime ? (
                        <span className="slot-time">
                          <Clock size={12} /> {slot.startTime} - {slot.endTime}
                        </span>
                      ) : (
                        <span className="slot-time text-muted">Times hidden by user</span>
                      )}
                      <span className="slot-muscles truncate">
                        {slot.muscleGroups?.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="modal-actions-bar">
              <Button variant="secondary" onClick={() => setSelectedMatch(null)}>
                Close
              </Button>
              {getRelationshipStatus(selectedMatch.candidate._id) === 'none' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    sendRequest(selectedMatch.candidate._id);
                    setSelectedMatch(null);
                  }}
                >
                  Send Partner Request
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Matches;
