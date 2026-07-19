import api from './api';

// 1. AUTH SERVICES
export const authService = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  getMe: () => api.get('/api/auth/me'),
};

// 2. USER SERVICES
export const userService = {
  updateProfile: (data) => api.patch('/api/users/profile', data),
  selectGym: (data) => api.patch('/api/users/gym', data),
  getMatchingProfile: () => api.get('/api/users/matching-profile'),
  updatePrivacySettings: (data) => api.patch('/api/users/privacy', data),
  getAllTestUsers: () => api.get('/test-user'), // Special test route
};

// 3. WORKOUT SERVICES
export const workoutService = {
  createWorkout: (data) => api.post('/api/workouts', data),
  getWorkouts: () => api.get('/api/workouts'),
  updateWorkout: (id, data) => api.patch(`/api/workouts/${id}`, data),
  deleteWorkout: (id) => api.delete(`/api/workouts/${id}`),
};

// 4. MATCH SERVICES
export const matchService = {
  getMatches: () => api.get('/api/matches'),
  getMatchDetails: (candidateId) => api.get(`/api/matches/${candidateId}`),
};

// 5. PARTNER REQUEST SERVICES
export const partnerRequestService = {
  sendRequest: (data) => api.post('/api/partner-requests', data),
  getReceivedRequests: () => api.get('/api/partner-requests/received'),
  getSentRequests: () => api.get('/api/partner-requests/sent'),
  acceptRequest: (id) => api.patch(`/api/partner-requests/${id}/accept`),
  rejectRequest: (id) => api.patch(`/api/partner-requests/${id}/reject`),
  getConnections: () => api.get('/api/partner-requests/connections'),
};

// 6. TODAY WORKOUT SERVICES
export const todayService = {
  joinToday: (data) => api.post('/api/today/join', data),
  leaveToday: () => api.post('/api/today/leave'),
  getActiveUsers: () => api.get('/api/today/active'),
  getTodayMatches: () => api.get('/api/today/matches'),
};

// 7. BLOCK SERVICES
export const blockService = {
  blockUser: (data) => api.post('/api/blocks', data),
};

// 8. REPORT SERVICES
export const reportService = {
  reportUser: (data) => api.post('/api/reports', data),
};

// 9. CHAT SERVICES (Conversations & Messages)
export const chatService = {
  createOrGetConversation: (data) => api.post('/api/conversations', data),
  getUserConversations: () => api.get('/api/conversations/user/all'),
  getConversationById: (id) => api.get(`/api/conversations/${id}`),
  sendMessage: (data) => api.post('/api/messages', data),
  getMessages: (conversationId) => api.get(`/api/messages/${conversationId}`),
};
