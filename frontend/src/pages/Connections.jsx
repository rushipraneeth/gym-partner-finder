import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import DashboardHeader from '../components/DashboardHeader';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import Input from '../components/Input';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Reporting State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [userToReport, setUserToReport] = useState(null);
  const [reportReason, setReportReason] = useState('Inappropriate Behavior');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await api.get('/api/partner-requests/connections');
      if (res.data.success) {
        setConnections(res.data.connections || []);
      }
    } catch (error) {
      addToast('Failed to load connections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (partnerId) => {
    try {
      // API call to create or get conversation
      const res = await api.post('/api/conversations', { otherUserId: partnerId });
      if (res.data.success) {
        // Navigate to chat with conversationId or partnerId selected
        navigate(`/chat?c=${res.data.conversation._id}`);
      }
    } catch (error) {
      addToast(error.message || 'Failed to open chat', 'error');
    }
  };

  const handleBlock = async (blockedId) => {
    if (!window.confirm("Are you sure you want to block this user? They will no longer be able to interact with you.")) return;
    try {
      const res = await api.post('/api/blocks', { blockedId });
      if (res.data.success) {
        addToast('User blocked successfully.', 'success');
        fetchConnections(); // Refresh list to remove them
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to block user', 'error');
    }
  };

  const handleOpenReport = (partner) => {
    setUserToReport(partner);
    setReportModalOpen(true);
  };

  const submitReport = async () => {
    if (!reportDescription.trim()) {
      addToast('Please provide a description.', 'error');
      return;
    }
    try {
      const res = await api.post('/api/reports', {
        reportedUserId: userToReport._id,
        reason: reportReason,
        description: reportDescription
      });
      if (res.data.success) {
        addToast('User reported successfully to moderation.', 'success');
        setReportModalOpen(false);
        setReportDescription('');
      }
    } catch(error) {
       addToast(error.response?.data?.message || 'Failed to report user', 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="connections-page animate-fade-in pb-10">
      <DashboardHeader />
      <p className="text-secondary mb-4">Users you have successfully connected with.</p>

      {connections.length === 0 ? (
        <div className="glass-card text-center py-5">
          <h3>No connections yet</h3>
          <p className="text-secondary">Send requests to your matches to build connections!</p>
        </div>
      ) : (
        <div className="matches-grid">
          {connections.map(conn => {
            // Determine which user is the partner (not the current user)
            const partner = conn.user1._id === user.id ? conn.user2 : conn.user1;
            
            return (
              <div key={conn._id} className="glass-card flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="match-avatar" style={{width: '50px', height: '50px', fontSize: '1.5rem'}}>
                    {partner.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{margin: '0', fontSize: '1.25rem', fontWeight: 600}}>{partner.username}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-100">
                  <Button variant="outline-secondary" size="sm" className="flex-1" onClick={() => handleBlock(partner._id)}>Block</Button>
                  <Button variant="outline-danger" size="sm" className="flex-1" onClick={() => handleOpenReport(partner)}>Report</Button>
                  <Button variant="outline-primary" size="sm" className="flex-1" onClick={() => openChat(partner._id)}>Chat</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Modal */}
      {userToReport && (
        <Modal 
          isOpen={reportModalOpen} 
          onClose={() => setReportModalOpen(false)} 
          title={`Report ${userToReport.username}`}
        >
          <div className="p-2">
            <p className="text-secondary mb-4">Please provide details about why you are reporting this user. False reports may result in account suspension.</p>
            
            <div className="form-group mb-3">
              <label className="form-label">Reason</label>
              <select 
                className="form-input" 
                value={reportReason} 
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="Inappropriate Behavior">Inappropriate Behavior</option>
                <option value="Spam or Scam">Spam or Scam</option>
                <option value="Harassment">Harassment</option>
                <option value="Fake Profile">Fake Profile</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group mb-4">
              <label className="form-label">Description</label>
              <textarea 
                className="form-input" 
                rows="4" 
                placeholder="Provide more details..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              ></textarea>
            </div>
            
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setReportModalOpen(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1" style={{backgroundColor: '#ef4444'}} onClick={submitReport}>Submit Report</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Connections;
