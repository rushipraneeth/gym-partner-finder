import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
      });
      console.log('Socket initialized');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('joinConversation', conversationId);
    }
  }

  sendMessage(conversationId, senderId, receiverId, text) {
    if (this.socket) {
      this.socket.emit('sendMessage', {
        conversationId,
        senderId,
        receiverId,
        text
      });
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receiveMessage', callback);
    }
  }

  offReceiveMessage(callback) {
    if (this.socket) {
      this.socket.off('receiveMessage', callback);
    }
  }

  onChatError(callback) {
    if (this.socket) {
      this.socket.on('chatError', callback);
    }
  }

  offChatError(callback) {
    if (this.socket) {
      this.socket.off('chatError', callback);
    }
  }
}

export default new SocketService();
