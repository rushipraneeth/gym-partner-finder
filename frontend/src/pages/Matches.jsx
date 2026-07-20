import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import DashboardHeader from '../components/DashboardHeader';
import './Matches.css';

const Matches = () => {
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended' or 'all'
  const [matches, setMatches] = useState([]);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();
  const { user } = useAuth(); // Import useAuth to filter out self

  const filteredMatches = matches.filter(m => (m.candidate?.username || '').toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    fetchMatches();
    fetchMySchedule();
    fetchRelationships();
  }, []);

  const fetchMySchedule = async () => {
    try {
      const res = await api.get('/api/users/matching-profile');
      if (res.data.success && res.data.matchingProfile?.workoutSchedule?.length > 0) {
        setHasSchedule(true);
      }
    } catch (error) {
      // Ignored
    }
  };

  const fetchRelationships = async () => {
    try {
      const [connRes, sentRes, recRes] = await Promise.all([
        api.get('/api/partner-requests/connections'),
        api.get('/api/partner-requests/sent'),
        api.get('/api/partner-requests/received')
      ]);
      if (connRes.data.success) setConnections(connRes.data.connections);
      if (sentRes.data.success) setSentRequests(sentRes.data.sentRequests);
      if (recRes.data.success) setReceivedRequests(recRes.data.receivedRequests);
    } catch (error) {
      console.error('Failed to fetch relationships', error);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await api.get('/api/matches');
      if (res.data.success) {
        setMatches(res.data.eligibleCandidates || []);
      }
    } catch (error) {
      console.error(error); // Might be empty if schedule not set
    } finally {
      setLoading(false);
    }
  };

  // allUsers api removed as it's no longer needed

  const sendRequest = async (receiverId) => {
    try {
      const res = await api.post('/api/partner-requests', { receiverId });
      if (res.data.success) {
        addToast('Partner request sent!', 'success');
        fetchRelationships(); // Refresh status instantly
      }
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Failed to send request', 'error');
    }
  };

  const getRelationshipStatus = (candidateId) => {
    const isConnected = connections.some(c => 
      (c.user1._id === candidateId || c.user2._id === candidateId)
    );
    if (isConnected) return 'connected';

    const isSent = sentRequests.some(r => r.receiverId._id === candidateId && r.status === 'pending');
    if (isSent) return 'sent';

    const isReceived = receivedRequests.some(r => r.senderId._id === candidateId && r.status === 'pending');
    if (isReceived) return 'received';

    return 'none';
  };

  const renderActionButton = (candidateId) => {
    const status = getRelationshipStatus(candidateId);
    
    if (status === 'connected') {
      return <Button variant="secondary" className="flex-1 w-100" disabled>Connected ✓</Button>;
    } else if (status === 'sent') {
      return <Button variant="secondary" className="flex-1 w-100" disabled>Request Sent</Button>;
    } else if (status === 'received') {
      return <Button variant="primary" className="flex-1 w-100" onClick={() => window.location.href = '/requests'}>Review Request</Button>;
    }
    
    return <Button variant="primary" className="flex-1 w-100" onClick={() => sendRequest(candidateId)}>Send Partner Request</Button>;
  };

  const openDetails = (match) => {
    setSelectedMatch(match);
  };

  if (loading) return <Loader />;

  return (
    <div className="matches-page animate-fade-in">
      <DashboardHeader />

      <div className="tabs flex gap-4 mb-4 border-bottom pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <button 
          className={`tab-btn ${activeTab === 'recommended' ? 'text-primary font-weight-bold' : 'text-secondary'}`} 
          onClick={() => setActiveTab('recommended')}
        >
          Recommended Matches
        </button>
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'text-primary font-weight-bold' : 'text-secondary'}`} 
          onClick={() => setActiveTab('all')}
        >
          Discover All Users
        </button>
      </div>

      <div className="mb-4">
        {activeTab === 'recommended' ? (
          <>
            <h2>Your Best Matches</h2>
            <p className="text-secondary">Matches are calculated based on your workout schedule, gym location, and fitness goals (Requires {">"}60% match score).</p>
          </>
        ) : (
          <>
            <h2>Discover All Users</h2>
            <p className="text-secondary">Quick view of all gym members matching your schedule {">"}60%.</p>
          </>
        )}
      </div>

      <div className="mb-4">
        <Input 
          placeholder="Search users by username..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredMatches.length === 0 ? (
        <div className="empty-state glass-card text-center py-5">
          <h3>No matches found right now.</h3>
          {!hasSchedule ? (
            <>
              <p className="text-secondary">You must complete your Profile (Gym & Goals) and Weekly Workout Schedule first to find matches.</p>
              <div className="flex gap-4 justify-center mt-4">
                <Button variant="primary" onClick={() => window.location.href = '/profile'}>
                  Complete Profile
                </Button>
                <Button variant="secondary" onClick={() => window.location.href = '/schedule'}>
                  Configure Schedule
                </Button>
              </div>
            </>
          ) : (
            <p className="text-secondary">There are no users in your gym matching your schedule &gt;60% right now. Check back later!</p>
          )}
        </div>
      ) : activeTab === 'recommended' ? (
        <div className="matches-grid">
          {filteredMatches.map((matchData) => {
          const { candidate, matchPercentage, scoreBreakdown } = matchData;
          return (
            <div key={candidate._id} className="glass-card match-card">
              <div className="match-card-header">
                <div className="match-avatar">{candidate.username.charAt(0).toUpperCase()}</div>
                <div className="match-info">
                  <h3>{candidate.username}</h3>
                  <span className="text-secondary text-sm">{candidate.goal} • {candidate.experienceLevel}</span>
                </div>
                <div className="match-score">
                  {matchPercentage}
                </div>
              </div>
              
              <div className="match-card-body mt-4">
                <p className="text-sm"><strong>Time Overlap:</strong> {scoreBreakdown.timeScore}</p>
                <p className="text-sm"><strong>Workout Similarity:</strong> {scoreBreakdown.workoutScore}</p>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="secondary" className="flex-1" onClick={() => openDetails(matchData)}>
                    View Details
                  </Button>
                  {renderActionButton(candidate._id)}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        <div className="matches-grid">
          {filteredMatches.map((matchData) => {
          const { candidate, matchPercentage } = matchData;
          return (
            <div key={candidate._id} className="glass-card match-card">
              <div className="match-card-header">
                <div className="match-avatar">{candidate.username.charAt(0).toUpperCase()}</div>
                <div className="match-info">
                  <h3>{candidate.username}</h3>
                  <span className="text-secondary text-sm">{candidate.goal}</span>
                </div>
                <div className="match-score">
                  {matchPercentage}
                </div>
              </div>
              
              <div className="match-card-body mt-4">
                <div className="flex mt-4">
                  {renderActionButton(candidate._id)}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {selectedMatch && (
        <Modal 
          isOpen={!!selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
          title={`Match Details: ${selectedMatch.candidate.username}`}
        >
          <div className="match-details-modal">
            <h2 className="text-center text-primary mb-4">{selectedMatch.matchPercentage} Match</h2>
            
            <div className="breakdown-grid mb-4">
              <div className="breakdown-item glass-card text-center p-3">
                <div className="text-xl font-weight-bold">{selectedMatch.scoreBreakdown.timeScore}</div>
                <div className="text-sm text-secondary">Time Match</div>
              </div>
              <div className="breakdown-item glass-card text-center p-3">
                <div className="text-xl font-weight-bold">{selectedMatch.scoreBreakdown.dayScore}</div>
                <div className="text-sm text-secondary">Day Match</div>
              </div>
              <div className="breakdown-item glass-card text-center p-3">
                <div className="text-xl font-weight-bold">{selectedMatch.scoreBreakdown.workoutScore}</div>
                <div className="text-sm text-secondary">Workout Match</div>
              </div>
            </div>

            <div className="match-reasons glass-card p-4">
              <h4 className="mb-2">Why you match:</h4>
              <ul className="reasons-list">
                {selectedMatch.matchReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-center gap-2 mb-2">
                    <span className="text-primary">✓</span> {reason}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4">
              {renderActionButton(selectedMatch.candidate._id)}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Matches;
