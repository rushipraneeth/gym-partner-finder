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
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();
  const { user } = useAuth(); // Import useAuth to filter out self

  const filteredMatches = matches.filter(m => (m.candidate?.username || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUsers = allUsers.filter(u => (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    fetchMatches();
    fetchAllUsers();
  }, []);

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

  const fetchAllUsers = async () => {
    try {
      const res = await api.get('/test-user');
      if (res.data.success) {
        setAllUsers(res.data.data.filter(u => u._id !== user.id)); // Exclude self
      }
    } catch (error) {
      console.error('Failed to fetch all users', error);
    }
  };

  const sendRequest = async (receiverId) => {
    try {
      const res = await api.post('/api/partner-requests', { receiverId });
      if (res.data.success) {
        addToast('Partner request sent!', 'success');
        // Optionally, remove the user from matches or mark as pending
      }
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Failed to send request', 'error');
    }
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
        <Input 
          placeholder="Search users by username..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {activeTab === 'recommended' ? (
        filteredMatches.length === 0 ? (
          <div className="empty-state glass-card text-center py-5">
            <h3>No matches found right now.</h3>
            <p className="text-secondary">Try updating your schedule or modifying your profile goals.</p>
          </div>
        ) : (
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
                    <Button variant="primary" className="flex-1" onClick={() => sendRequest(candidate._id)}>
                      Send Request
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )
      ) : (
        filteredUsers.length === 0 ? (
          <div className="empty-state glass-card text-center py-5">
            <h3>No users found matching "{searchQuery}".</h3>
          </div>
        ) : (
          <div className="matches-grid">
            {filteredUsers.map((candidate) => (
              <div key={candidate._id} className="glass-card match-card">
                <div className="match-card-header">
                  <div className="match-avatar">{candidate.username.charAt(0).toUpperCase()}</div>
                  <div className="match-info">
                    <h3>{candidate.username}</h3>
                    <span className="text-secondary text-sm">{candidate.goal || 'No goal set'} • {candidate.experienceLevel || 'No level set'}</span>
                  </div>
                </div>
                
                <div className="match-card-body mt-4">
                  <div className="flex mt-4">
                    <Button variant="primary" className="w-100" onClick={() => sendRequest(candidate._id)}>
                      Send Partner Request
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
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
            
            <Button 
              variant="primary" 
              className="w-100 mt-4" 
              onClick={() => {
                sendRequest(selectedMatch.candidate._id);
                setSelectedMatch(null);
              }}
            >
              Send Partner Request
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Matches;
