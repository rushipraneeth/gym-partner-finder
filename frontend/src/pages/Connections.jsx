import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/Button';
import Loader from '../components/Loader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import UserAvatar from '../components/common/UserAvatar';
import {
  UserCheck,
  MessageSquare,
  Shield,
  AlertTriangle,
  ArrowRight,
} from '../components/common/Icons';
import './Connections.css';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Block Dialog State
  const [userToBlock, setUserToBlock] = useState(null);
  const [blocking, setBlocking] = useState(false);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [userToReport, setUserToReport] = useState(null);
  const [reportReason, setReportReason] = useState('Inappropriate Behavior');
  const [reportDescription, setReportDescription] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
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
      const res = await api.post('/api/conversations', { otherUserId: partnerId });
      if (res.data.success) {
        navigate(`/chat?c=${res.data.conversation._id}`);
      }
    } catch (error) {
      addToast(error.message || 'Failed to open chat', 'error');
    }
  };

  const handleConfirmBlock = async () => {
    if (!userToBlock) return;
    setBlocking(true);
    try {
      const res = await api.post('/api/blocks', { blockedId: userToBlock._id });
      if (res.data.success) {
        addToast(`User ${userToBlock.username} blocked successfully.`, 'info');
        setUserToBlock(null);
        fetchConnections();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to block user', 'error');
    } finally {
      setBlocking(false);
    }
  };

  const handleOpenReport = (partner) => {
    setUserToReport(partner);
    setReportReason('Inappropriate Behavior');
    setReportDescription('');
    setReportModalOpen(true);
  };

  const submitReport = async (e) => {
    e.preventDefault();
    if (!reportDescription.trim()) {
      addToast('Please provide details for the report.', 'warning');
      return;
    }
    setReporting(true);
    try {
      const res = await api.post('/api/reports', {
        reportedUserId: userToReport._id,
        reason: reportReason,
        description: reportDescription,
      });
      if (res.data.success) {
        addToast('Report submitted successfully to moderation.', 'success');
        setReportModalOpen(false);
        setUserToReport(null);
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to report user', 'error');
    } finally {
      setReporting(false);
    }
  };

  if (loading) return <Loader text="Loading your gym partners..." />;

  return (
    <div className="connections-view animate-fade-in">
      <PageHeader
        title="Partner Directory"
        description="Your established workout partners. Coordinate routines via direct messaging or manage connection safety."
        badge={<span className="badge badge-success">{connections.length} Active Partners</span>}
      />

      {connections.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No confirmed partners yet"
          description="Send invitations to members with matching workout splits in Find Partners to build your gym buddy network."
          action={
            <Button variant="primary" onClick={() => navigate('/matches')}>
              Find Compatible Partners <ArrowRight size={14} />
            </Button>
          }
        />
      ) : (
        <div className="connections-grid">
          {connections.map((conn) => {
            const partner = conn.user1?._id === user?.id ? conn.user2 : conn.user1;
            if (!partner) return null;

            return (
              <div key={conn._id} className="card connection-card flex flex-col justify-between">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar name={partner.username} size="lg" isOnline />
                      <div className="min-w-0">
                        <h3 className="truncate" style={{ fontSize: '1rem', margin: 0 }}>
                          {partner.username}
                        </h3>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          {partner.email}
                        </span>
                      </div>
                    </div>

                    <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>
                      Connected
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Active training partner. Real-time messaging enabled.
                  </p>
                </div>

                <div className="card-footer" style={{ padding: '0.875rem 1.25rem' }}>
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => openChat(partner._id)}
                    >
                      <MessageSquare size={14} /> Message
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      title="Block user"
                      onClick={() => setUserToBlock(partner)}
                    >
                      <Shield size={14} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      title="Report user"
                      onClick={() => handleOpenReport(partner)}
                    >
                      <AlertTriangle size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Block Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!userToBlock}
        onClose={() => setUserToBlock(null)}
        onConfirm={handleConfirmBlock}
        title={`Block ${userToBlock?.username}?`}
        message="This user will be disconnected and will no longer be able to message you, view your profile, or send partner requests."
        confirmText="Block Partner"
        variant="danger"
        loading={blocking}
      />

      {/* Report Modal */}
      {userToReport && (
        <Modal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          title={`Report ${userToReport.username}`}
          subtitle="Reports are confidential and reviewed by moderation"
          maxWidth="480px"
        >
          <form onSubmit={submitReport}>
            <div className="form-group mb-4">
              <label className="form-label">Reason for Report</label>
              <select
                className="form-select"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="Inappropriate Behavior">Inappropriate Behavior</option>
                <option value="Spam or Scam">Spam or Commercial Scam</option>
                <option value="Harassment">Harassment or Abuse</option>
                <option value="Fake Profile">Impersonation / Fake Profile</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group mb-5">
              <label className="form-label">
                Description
                <span className="form-label-hint">Provide specific context</span>
              </label>
              <textarea
                className="form-textarea"
                rows="4"
                placeholder="Explain what happened so our trust and safety team can take appropriate action..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                required
              />
            </div>

            <div className="modal-actions-bar">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setReportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" type="submit" disabled={reporting}>
                {reporting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Connections;
