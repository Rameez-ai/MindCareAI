import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 unauthorized responses (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.match(/^\/(login|register|)$/)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email, password, displayName) => 
    api.post('/auth/register', { email, password, display_name: displayName }),
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve({ data: { detail: 'Logged out locally' } });
  },
};

export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
};

export const chatAPI = {
  getChats: () => api.get('/chat/history'),
  getChatDetails: (chatId) => api.get(`/chat/${chatId}`),
  sendMessage: (chatId, content) => api.post('/chat', { chat_id: chatId, content }),
  deleteChat: (chatId) => api.delete(`/chat/${chatId}`),
};

export const moodAPI = {
  logMood: (mood, intensity, note) => api.post('/mood/add', { mood, intensity, note }),
  getMoodHistory: (limit = 30) => api.get(`/mood/history?limit=${limit}`),
};

export const analyticsAPI = {
  getAnalytics: () => api.get('/analytics'),
};

export const crisisAPI = {
  checkCrisis: (text) => api.post('/crisis-check', { text }),
};

export default api;
