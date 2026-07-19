import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import socketService from '../services/socket';
import Loader from '../components/Loader';
import Button from '../components/Button';
import './Chat.css';

const Chat = () => {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialConvId = searchParams.get('c');

  const [connections, setConnections] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socketService.connect();
    fetchConnections();

    const handleReceiveMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleChatError = (err) => {
      addToast(err.message || 'Chat error', 'error');
    };

    socketService.onReceiveMessage(handleReceiveMessage);
    socketService.onChatError(handleChatError);

    return () => {
      socketService.offReceiveMessage(handleReceiveMessage);
      socketService.offChatError(handleChatError);
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (initialConvId) {
      loadConversationData(initialConvId);
    }
  }, [initialConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConnections = async () => {
    try {
      const res = await api.get('/api/partner-requests/connections');
      if (res.data.success) {
        setConnections(res.data.connections || []);
      }
    } catch (error) {
      addToast('Failed to load chat connections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadConversationData = async (convId) => {
    try {
      socketService.joinConversation(convId);
      const res = await api.get(`/api/messages/${convId}`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectPartner = async (partnerId) => {
    try {
      const res = await api.post('/api/conversations', { otherUserId: partnerId });
      if (res.data.success) {
        const conv = res.data.conversation;
        setActiveConversation({
          id: conv._id,
          partnerId: partnerId
        });
        setSearchParams({ c: conv._id });
      }
    } catch (error) {
      addToast(error.message || 'Failed to start conversation', 'error');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    socketService.sendMessage(activeConversation.id, user.id, activeConversation.partnerId, newMessage);
    setNewMessage('');
  };

  const getPartnerFromConnection = (conn) => {
    return conn.user1._id === user.id ? conn.user2 : conn.user1;
  };

  if (loading) return <Loader />;

  return (
    <div className="chat-container glass-card">
      <div className="chat-sidebar border-right">
        <h3 className="p-3 m-0 border-bottom">Conversations</h3>
        <div className="connections-list">
          {connections.length === 0 ? (
             <p className="p-3 text-secondary text-sm">No connections yet.</p>
          ) : (
            connections.map(conn => {
              const partner = getPartnerFromConnection(conn);
              const isActive = activeConversation?.partnerId === partner._id;
              
              return (
                <div 
                  key={conn._id} 
                  className={`connection-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectPartner(partner._id)}
                >
                  <div className="avatar-sm">{partner.username.charAt(0).toUpperCase()}</div>
                  <div className="connection-name">{partner.username}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="chat-main">
        {activeConversation || initialConvId ? (
          <>
            <div className="chat-header">
              <h3>Chat</h3>
            </div>
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="text-center text-secondary mt-5">No messages yet. Say hi!</div>
              )}
              {messages.map((msg, index) => {
                // If senderId is populated object or string
                const senderIdStr = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
                const isMe = senderIdStr === user.id;
                
                return (
                  <div key={index} className={`chat-bubble-wrapper ${isMe ? 'mine' : 'theirs'}`}>
                    <div className="chat-bubble">
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area">
              <form onSubmit={handleSendMessage} className="flex gap-2 w-100">
                <input 
                  type="text" 
                  className="form-input flex-1 m-0" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" variant="primary">Send</Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-100 text-secondary">
            Select a connection to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
