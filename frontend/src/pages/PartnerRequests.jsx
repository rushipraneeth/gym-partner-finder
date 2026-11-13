import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/Button';
import Loader from '../components/Loader';
import EmptyState from '../components/common/EmptyState';
import UserAvatar from '../components/common/UserAvatar';
import {
  Inbox,
  Check,
  X,
  Clock,
  ArrowRight,
  Send,
} from '../components/common/Icons';
import './PartnerRequests.css';

const PartnerRequests = () => {
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [receivedRes, sentRes] = await Promise.all([
        api.get('/api/partner-requests/received'),
        api.get('/api/partner-requests/sent'),
      ]);

      if (receivedRes.data.success) {
        setReceived(receivedRes.data.receivedRequests || []);
      }
      if (sentRes.data.success) {
        setSent(sentRes.data.sentRequests || []);
      }
    } catch (error) {
      addToast('Failed to load partner requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setProcessingId(id);
    try {
      const res = await api.patch(`/api/partner-requests/${id}/accept`);
      if (res.data.success) {
        addToast('Partner request accepted! Connection established.', 'success');
        fetchRequests();
      }
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Failed to accept request', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      const res = await api.patch(`/api/partner-requests/${id}/reject`);
      if (res.data.success) {
        addToast('Partner request declined.', 'info');
        fetchRequests();
      }
    } catch (error) {
      addToast(error.response?.data?.message || error.message || 'Failed to decline request', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Loader text="Loading partner requests..." />;

  const pendingReceivedCount = received.filter((r) => r.status === 'pending').length;

  return (
    <div className="requests-view animate-fade-in">
      <PageHeader
        title="Partner Requests"
        description="Manage incoming workout partnership invitations and review sent invitations."
        badge={
          pendingReceivedCount > 0 ? (
            <span className="badge badge-warning">{pendingReceivedCount} Pending Review</span>
          ) : null
        }
      />

      {/* Tabs */}
      <div className="tabs-header-bar mb-6">
        <div className="segmented-control">
          <button
            className={`segmented-btn ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            <Inbox size={15} />
            Received Requests ({received.length})
            {pendingReceivedCount > 0 && (
              <span className="badge badge-warning" style={{ fontSize: '0.6875rem', padding: '0.125rem 0.375rem' }}>
                {pendingReceivedCount} new
              </span>
            )}
          </button>
          <button
            className={`segmented-btn ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            <Send size={15} />
            Sent Requests ({sent.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="requests-content-area">
        {activeTab === 'received' ? (
          received.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No received requests"
              description="When other gym members want to pair up for workouts, their invitations will appear here."
            />
          ) : (
            <div className="requests-list-grid">
              {received.map((req) => {
                const sender = req.senderId || {};
                const isPending = req.status === 'pending';

                return (
                  <div key={req._id} className="card request-card">
                    <div className="card-body">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar name={sender.username || 'User'} size="md" />
                          <div className="min-w-0">
                            <h4 className="truncate" style={{ fontSize: '0.9375rem', margin: 0 }}>
                              {sender.username || 'Gym Member'}
                            </h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {sender.email || 'Fitness Partner'}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`badge ${
                            req.status === 'accepted'
                              ? 'badge-success'
                              : req.status === 'rejected'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {req.status === 'pending' ? 'Needs Review' : req.status}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                        Wants to connect as your gym workout partner.
                      </p>
                    </div>

                    <div className="card-footer" style={{ padding: '0.75rem 1.25rem' }}>
                      {isPending ? (
                        <div className="flex items-center gap-2 w-full justify-end">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            disabled={processingId === req._id}
                            onClick={() => handleReject(req._id)}
                          >
                            <X size={14} /> Decline
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={processingId === req._id}
                            onClick={() => handleAccept(req._id)}
                          >
                            <Check size={14} /> Accept Partner
                          </Button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Request was {req.status}.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : sent.length === 0 ? (
          <EmptyState
            icon={Send}
            title="No sent invitations"
            description="Explore matched members at your gym and send invitations to train together."
            action={
              <Button variant="primary" onClick={() => (window.location.href = '/matches')}>
                Find Partners <ArrowRight size={14} />
              </Button>
            }
          />
        ) : (
          <div className="requests-list-grid">
            {sent.map((req) => {
              const receiver = req.receiverId || {};

              return (
                <div key={req._id} className="card request-card">
                  <div className="card-body">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar name={receiver.username || 'User'} size="md" />
                        <div className="min-w-0">
                          <h4 className="truncate" style={{ fontSize: '0.9375rem', margin: 0 }}>
                            {receiver.username || 'Member'}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {receiver.email || 'Partner Candidate'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`badge ${
                          req.status === 'accepted'
                            ? 'badge-success'
                            : req.status === 'rejected'
                            ? 'badge-danger'
                            : 'badge-neutral'
                        }`}
                      >
                        {req.status === 'pending' ? 'Pending Acceptance' : req.status}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>
                      {req.status === 'pending'
                        ? 'Waiting for recipient to review and accept.'
                        : req.status === 'accepted'
                        ? 'Request accepted! You are now connected.'
                        : 'Recipient declined the partnership request.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerRequests;
