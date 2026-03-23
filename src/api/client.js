import axios from 'axios';

// API base URL: production dùng Render, dev dùng Vite proxy
const API_BASE = import.meta.env.PROD
  ? 'https://chatbot-saas-be.onrender.com/api'
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s timeout (embedding có thể lâu)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: tự động gắn JWT token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== Auth APIs ====================
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  // Admin only
  getUsers: () => api.get('/auth/users'),
  updateRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }),
  toggleActive: (id) => api.put(`/auth/users/${id}/toggle`)
};

// ==================== Bot APIs ====================
export const botApi = {
  getAll: () => api.get('/bots'),
  getById: (id) => api.get(`/bots/${id}`),
  create: (data) => api.post('/bots', data),
  update: (id, data) => api.put(`/bots/${id}`, data),
  delete: (id) => api.delete(`/bots/${id}`)
};

// ==================== Chat APIs ====================
export const chatApi = {
  sendMessage: (botId, message) => api.post(`/bots/${botId}/chat`, { message }),
  getMessages: (botId, limit = 50) => api.get(`/bots/${botId}/messages`, { params: { limit } }),
  clearMessages: (botId) => api.delete(`/bots/${botId}/messages`)
};

// ==================== Knowledge APIs ====================
export const knowledgeApi = {
  upload: (botId, text) => api.post(`/bots/${botId}/knowledge`, { text }),
  uploadPdf: (botId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/bots/${botId}/knowledge/pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAll: (botId) => api.get(`/bots/${botId}/knowledge`),
  getDetail: (botId, docId) => api.get(`/bots/${botId}/knowledge/${docId}`),
  getDownloadUrl: (botId, docId) => `${API_BASE}/bots/${botId}/knowledge/${docId}/download`,
  delete: (botId, docId) => api.delete(`/bots/${botId}/knowledge/${docId}`)
};

export default api;

