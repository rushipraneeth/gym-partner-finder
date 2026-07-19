import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Button from '../components/Button';
import Loader from '../components/Loader';
import DashboardHeader from '../components/DashboardHeader';

const PartnerRequests = () => {
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [receivedRes, sentRes] = await Promise.all([
        api.get('/api/partner-requests/received'),
        api.get('/api/partner-requests/sent')
      ]);
      if (receivedRes.data.success) {
        setReceived(receivedRes.data.receivedRequests);
      }
      if (sentRes.data.success) {
        setSent(sentRes.data.sentRequests);
      }
    } catch (error) {
      addToast('Failed to load partner requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.patch(`/api/partner-requests/${id}/accept`);
      addToast('Partner request accepted!', 'success');
      fetchRequests(); // Refresh lists
    } catch (error) {
      addToast(error.message || 'Failed to accept', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/api/partner-requests/${id}/reject`);
      addToast('Partner request rejected', 'info');
      fetchRequests();
    } catch (error) {
      addToast(error.message || 'Failed to reject', 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="requests-page animate-fade-in pb-10">
      <DashboardHeader />
      
      <div className="tabs flex gap-4 mb-4 border-bottom pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <button 
          className={`tab-btn ${activeTab === 'received' ? 'text-primary font-weight-bold' : 'text-secondary'}`} 
          onClick={() => setActiveTab('received')}
        >
          Received ({received.filter(r => r.status === 'pending').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sent' ? 'text-primary font-weight-bold' : 'text-secondary'}`} 
          onClick={() => setActiveTab('sent')}
        >
          Sent
        </button>
      </div>

      <div className="requests-list">
        {activeTab === 'received' ? (
          received.length === 0 ? (
             <p className="text-secondary py-5 text-center">No received requests.</p>
          ) : (
            <div className="matches-grid">
              {received.map(req => (
                <div key={req._id} className="glass-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="match-avatar" style={{width: '40px', height: '40px', fontSize: '1.2rem'}}>
                      {req.senderId.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{margin: 0}}>{req.senderId.username}</h4>
                      <span className="text-sm text-secondary">Status: {req.status}</span>
                    </div>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={() => handleAccept(req._id)}>Accept</Button>
                      <Button variant="danger" size="sm" onClick={() => handleReject(req._id)}>Reject</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          sent.length === 0 ? (
            <p className="text-secondary py-5 text-center">No sent requests.</p>
          ) : (
            <div className="matches-grid">
              {sent.map(req => (
                <div key={req._id} className="glass-card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="match-avatar" style={{width: '40px', height: '40px', fontSize: '1.2rem'}}>
                      {req.receiverId.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{margin: 0}}>{req.receiverId.username}</h4>
                    </div>
                  </div>
                  <div>
                    <span className={`tag ${req.status === 'accepted' ? 'text-primary' : req.status === 'rejected' ? 'text-error' : ''}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PartnerRequests;
