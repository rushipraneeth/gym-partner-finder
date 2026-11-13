import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import socketService from '../services/socket';
import PageHeader from '../components/common/PageHeader';
import UserAvatar from '../components/common/UserAvatar';
import Button from '../components/Button';
import Loader from '../components/Loader';
import EmptyState from '../components/common/EmptyState';
import {
  MessageSquare,
  Search,
  Send,
  CornerDownLeft,
  ChevronLeft,
  Clock,
  CheckCheck,
  Shield,
  AlertCircle,
  Dumbbell,
} from '../components/common/Icons';
import './Chat.css';

const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatConversationDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const Chat = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialConvId = searchParams.get('c');

  const [connections, setConnections] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [unreadNewMessageNotice, setUnreadNewMessageNotice] = useState(false);
  const [conversationLastMessages, setConversationLastMessages] = useState({});

  const messagesEndRef = useRef(null);
  const chatMessagesContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize Socket connection
  useEffect(() => {
    socketService.connect();

    const handleReceiveMessage = (message) => {
      // Check if message belongs to active conversation
      setMessages((prev) => {
        // Prevent duplicate message entries
        if (prev.some((m) => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });

      // Update last message map
      if (message.conversationId) {
        setConversationLastMessages((prev) => ({
          ...prev,
          [message.conversationId]: {
            text: message.text,
            createdAt: message.createdAt || new Date().toISOString(),
          },
        }));
      }

      // Check if user is scrolled up
      const container = chatMessagesContainerRef.current;
      if (container) {
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 120;
        if (!isNearBottom) {
          setUnreadNewMessageNotice(true);
        }
      }
    };

    const handleChatError = (err) => {
      addToast(err.message || 'Chat error occurred', 'error');
    };

    socketService.onReceiveMessage(handleReceiveMessage);
    socketService.onChatError(handleChatError);

    return () => {
      socketService.offReceiveMessage(handleReceiveMessage);
      socketService.offChatError(handleChatError);
      socketService.disconnect();
    };
  }, [addToast]);

  // Load Connections
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await api.get('/api/partner-requests/connections');
        if (res.data.success) {
          const list = res.data.connections || [];
          setConnections(list);

          // If initial conversation ID in URL, find corresponding partner
          if (initialConvId) {
            handleOpenConversationById(initialConvId, list);
          } else if (list.length > 0 && window.innerWidth > 768) {
            // Auto select first partner on desktop
            const firstPartner = list[0].user1?._id === user?.id ? list[0].user2 : list[0].user1;
            if (firstPartner) {
              handleSelectPartner(firstPartner);
            }
          }
        }
      } catch (error) {
        addToast('Failed to load chat conversations', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [user?.id]);

  // Handle open conversation when ID given
  const handleOpenConversationById = async (convId, connsList) => {
    setLoadingMessages(true);
    try {
      socketService.joinConversation(convId);
      const res = await api.get(`/api/messages/${convId}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);

        // Find partner for this conversation if available
        setActiveConversation({ id: convId });

        // Update last message preview
        const msgs = res.data.messages || [];
        if (msgs.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          setConversationLastMessages((prev) => ({
            ...prev,
            [convId]: {
              text: lastMsg.text,
              createdAt: lastMsg.createdAt,
            },
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Select partner to chat with
  const handleSelectPartner = async (partner) => {
    setActivePartner(partner);
    setLoadingMessages(true);
    setMessages([]);
    try {
      const res = await api.post('/api/conversations', { otherUserId: partner._id });
      if (res.data.success) {
        const conv = res.data.conversation;
        setActiveConversation({
          id: conv._id,
          partnerId: partner._id,
        });
        setSearchParams({ c: conv._id });

        // Join room
        socketService.joinConversation(conv._id);

        // Fetch message history
        const msgRes = await api.get(`/api/messages/${conv._id}`);
        if (msgRes.data.success) {
          const fetchedMsgs = msgRes.data.messages || [];
          setMessages(fetchedMsgs);

          if (fetchedMsgs.length > 0) {
            const last = fetchedMsgs[fetchedMsgs.length - 1];
            setConversationLastMessages((prev) => ({
              ...prev,
              [conv._id]: {
                text: last.text,
                createdAt: last.createdAt,
              },
            }));
          }
        }
      }
    } catch (error) {
      addToast(error.message || 'Failed to open conversation', 'error');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Scroll to bottom logic
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setUnreadNewMessageNotice(false);
  }, []);

  // Monitor user scroll position to avoid forceful auto-scrollback
  const handleScroll = () => {
    const container = chatMessagesContainerRef.current;
    if (!container) return;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 80;
    setIsUserScrolledUp(!isNearBottom);
    if (isNearBottom) {
      setUnreadNewMessageNotice(false);
    }
  };

  // Auto-scroll on new message unless scrolled up
  useEffect(() => {
    if (!isUserScrolledUp) {
      scrollToBottom('smooth');
    }
  }, [messages, isUserScrolledUp, scrollToBottom]);

  // Send message
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const partnerId =
      activePartner?._id ||
      activeConversation.partnerId ||
      connections
        .map((c) => (c.user1?._id === user?.id ? c.user2?._id : c.user1?._id))
        .find(Boolean);

    socketService.sendMessage(
      activeConversation.id,
      user.id,
      partnerId,
      newMessage.trim()
    );

    setNewMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    scrollToBottom('smooth');
  };

  // Keyboard shortcut: Enter to send, Shift + Enter for new line
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-grow textarea
  const handleTextareaChange = (e) => {
    setNewMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const getPartnerFromConnection = (conn) => {
    return conn.user1?._id === user?.id ? conn.user2 : conn.user1;
  };

  // Filter connections by search
  const filteredConnections = connections.filter((conn) => {
    const partner = getPartnerFromConnection(conn);
    return (partner?.username || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <Loader text="Loading messaging workspace..." />;

  const isMobileDetailOpen = !!activeConversation && window.innerWidth <= 768;

  return (
    <div className="chat-page-view animate-fade-in">
      <PageHeader
        title="Messages"
        description="Encrypted real-time communication with your connected workout partners."
        badge={
          <span className="badge badge-success">
            <span className="badge-dot" /> Connected to Server
          </span>
        }
      />

      {connections.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="You can chat with members once a mutual partner request has been accepted."
          action={
            <Button variant="primary" onClick={() => (window.location.href = '/matches')}>
              Find Workout Partners
            </Button>
          }
        />
      ) : (
        <div className="card chat-workspace-container">
          {/* Conversation Sidebar (Panel 1) */}
          <div className={`chat-sidebar-pane ${isMobileDetailOpen ? 'mobile-hidden' : ''}`}>
            <div className="chat-sidebar-header">
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>Conversations</h3>
              <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                {connections.length}
              </span>
            </div>

            <div className="chat-search-wrap">
              <Input
                icon={Search}
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ margin: 0 }}
              />
            </div>

            <div className="conversations-scroll-list">
              {filteredConnections.length === 0 ? (
                <div className="text-center py-6 px-4">
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    No conversations match "{searchQuery}"
                  </p>
                </div>
              ) : (
                filteredConnections.map((conn) => {
                  const partner = getPartnerFromConnection(conn);
                  if (!partner) return null;
                  const isActive = activePartner?._id === partner._id;
                  const lastMessageInfo = conversationLastMessages[conn._id] || {};

                  return (
                    <div
                      key={conn._id}
                      className={`conversation-item-row ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectPartner(partner)}
                      role="button"
                      tabIndex={0}
                    >
                      <UserAvatar name={partner.username} size="md" isOnline />
                      <div className="conversation-meta min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="conversation-name truncate">{partner.username}</h4>
                          {lastMessageInfo.createdAt && (
                            <span className="conversation-time">
                              {formatConversationDate(lastMessageInfo.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="conversation-preview truncate">
                          {lastMessageInfo.text || 'Click to coordinate workouts...'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Conversation (Panel 2) */}
          <div className={`chat-main-pane ${!isMobileDetailOpen ? 'mobile-visible-desktop' : ''}`}>
            {activeConversation ? (
              <div className="chat-thread-wrapper">
                {/* Chat Header */}
                <div className="chat-thread-header">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      className="chat-mobile-back-btn"
                      onClick={() => setActiveConversation(null)}
                      aria-label="Back to conversations"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <UserAvatar name={activePartner?.username || 'Partner'} size="md" isOnline />
                    <div className="min-w-0">
                      <h4 className="active-partner-name truncate" style={{ margin: 0 }}>
                        {activePartner?.username || 'Gym Partner'}
                      </h4>
                      <span className="active-partner-status">
                        <span className="badge-dot" style={{ backgroundColor: 'var(--success)' }} />
                        Active workout partner
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                      <Shield size={12} /> Safe Chat
                    </span>
                  </div>
                </div>

                {/* Messages Body */}
                <div
                  className="chat-thread-messages"
                  ref={chatMessagesContainerRef}
                  onScroll={handleScroll}
                >
                  {loadingMessages ? (
                    <Loader text="Loading message history..." />
                  ) : messages.length === 0 ? (
                    <div className="chat-empty-thread text-center">
                      <div className="chat-empty-icon mb-3">
                        <MessageSquare size={28} color="var(--primary)" />
                      </div>
                      <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                        Start your conversation with {activePartner?.username || 'your partner'}
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Coordinate meeting times, spotter assistance, and exercise splits.
                      </p>
                    </div>
                  ) : (
                    <div className="messages-stream flex flex-col gap-3">
                      {messages.map((msg, index) => {
                        const senderIdStr =
                          typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
                        const isMe = senderIdStr === user?.id;

                        return (
                          <div
                            key={msg._id || index}
                            className={`message-bubble-row ${isMe ? 'is-me' : 'is-partner'}`}
                          >
                            {!isMe && (
                              <UserAvatar
                                name={activePartner?.username || 'P'}
                                size="xs"
                                className="message-sender-avatar"
                              />
                            )}
                            <div className="message-bubble-wrapper">
                              <div className="message-bubble-content">{msg.text}</div>
                              <span className="message-timestamp">
                                {formatMessageTime(msg.createdAt)}
                                {isMe && <CheckCheck size={12} className="ml-1 text-primary" />}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  {/* Floating Scroll-to-bottom / New message pill */}
                  {unreadNewMessageNotice && (
                    <button
                      className="chat-new-message-floating-pill"
                      onClick={() => scrollToBottom('smooth')}
                    >
                      ↓ New message received
                    </button>
                  )}
                </div>

                {/* Message Composer */}
                <div className="chat-thread-composer">
                  <form onSubmit={handleSendMessage} className="composer-form">
                    <textarea
                      ref={textareaRef}
                      className="composer-textarea"
                      placeholder={`Message ${activePartner?.username || 'partner'}... (Enter to send, Shift + Enter for new line)`}
                      value={newMessage}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      rows={1}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="composer-send-btn"
                      disabled={!newMessage.trim()}
                      title="Send message"
                    >
                      <Send size={15} />
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="chat-no-selection-placeholder flex flex-col items-center justify-center text-center p-8">
                <div className="no-selection-icon mb-3">
                  <MessageSquare size={32} color="var(--text-muted)" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Select a partner to chat
                </h3>
                <p style={{ fontSize: '0.84375rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                  Choose an active partner from the left sidebar to coordinate gym sessions in real time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
