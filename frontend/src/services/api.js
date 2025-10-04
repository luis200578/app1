import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Reduced timeout to 10s
  headers: {
    'Content-Type': 'application/json',
  },
  // Add retry configuration
  validateStatus: function (status) {
    return status < 500; // Accept any status code less than 500 as success
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Return only the data part
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'Erro desconhecido',
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Authentication APIs
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  refreshToken: () => apiClient.post('/auth/refresh'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password })
};

// User APIs
export const userAPI = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (profileData) => apiClient.put('/user/profile', profileData),
  getSettings: () => apiClient.get('/user/settings'),
  updateSettings: (settings) => apiClient.put('/user/settings', settings),
  getStats: () => apiClient.get('/user/stats'),
  changePassword: (passwords) => apiClient.post('/user/change-password', passwords),
  deleteAccount: (confirmation) => apiClient.delete('/user/account', { data: confirmation }),
  exportData: () => apiClient.get('/user/data')
};

// Chat APIs
export const chatAPI = {
  getConversations: (params = {}) => apiClient.get('/chat/conversations', { params }),
  createConversation: (conversationData) => apiClient.post('/chat/conversations', conversationData),
  getConversation: (id) => apiClient.get(`/chat/conversations/${id}`),
  deleteConversation: (id) => apiClient.delete(`/chat/conversations/${id}`),
  getMessages: (conversationId, params = {}) => apiClient.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, message) => apiClient.post(`/chat/conversations/${conversationId}/messages`, message),
  rateMessage: (messageId, rating) => apiClient.put(`/chat/messages/${messageId}/rating`, rating)
};

// Goals APIs
export const goalsAPI = {
  getGoals: (params = {}) => apiClient.get('/goals', { params }),
  createGoal: (goalData) => apiClient.post('/goals', goalData),
  getGoal: (id) => apiClient.get(`/goals/${id}`),
  updateGoal: (id, goalData) => apiClient.put(`/goals/${id}`, goalData),
  deleteGoal: (id) => apiClient.delete(`/goals/${id}`),
  updateProgress: (id, progressData) => apiClient.post(`/goals/${id}/progress`, progressData),
  getInsights: (id) => apiClient.get(`/goals/${id}/insights`),
  addMilestone: (id, milestone) => apiClient.post(`/goals/${id}/milestones`, milestone),
  completeMilestone: (id, milestoneId) => apiClient.put(`/goals/${id}/milestones/${milestoneId}`)
};

// Quiz APIs
export const quizAPI = {
  getQuestions: () => apiClient.get('/quiz/questions'),
  submitQuiz: (quizData) => apiClient.post('/quiz/submit', quizData),
  getResults: (params = {}) => apiClient.get('/quiz/results', { params }),
  getResult: (id) => apiClient.get(`/quiz/results/${id}`),
  getProgress: (trait, params = {}) => apiClient.get(`/quiz/progress/${trait}`, { params })
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: (params = {}) => apiClient.get('/analytics/dashboard', { params }),
  logMood: (moodData) => apiClient.post('/analytics/mood', moodData),
  getMoodHistory: (params = {}) => apiClient.get('/analytics/mood-history', { params }),
  getPatterns: (params = {}) => apiClient.get('/analytics/patterns', { params }),
  getInsights: (params = {}) => apiClient.get('/analytics/insights', { params }),
  getProgress: (params = {}) => apiClient.get('/analytics/progress', { params })
};

// Support APIs
export const supportAPI = {
  sendContact: (contactData) => apiClient.post('/support/contact', contactData),
  getFAQ: (params = {}) => apiClient.get('/support/faq', { params }),
  sendFeedback: (feedbackData) => apiClient.post('/support/feedback', feedbackData),
  getStatus: () => apiClient.get('/support/status'),
  getHelp: (params = {}) => apiClient.get('/support/help', { params })
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

export default apiClient;