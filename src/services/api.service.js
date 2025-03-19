import axios from 'axios';

// Базовый URL API - замените на ваш реальный API эндпоинт
const API_URL = process.env.REACT_APP_API_URL || 'https://api.cryptopatterns.xyz';

// Создаем экземпляр axios с базовым URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Перехватчик для добавления токена аутентификации
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Сервис для авторизации
export const authService = {
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },
  checkAuth: async () => {
    return apiClient.get('/auth/me');
  }
};

// Сервис для работы с криптовалютными паттернами
export const patternsService = {
  getAll: async () => {
    return apiClient.get('/patterns');
  },
  getById: async (id) => {
    return apiClient.get(`/patterns/${id}`);
  },
  create: async (data) => {
    return apiClient.post('/patterns', data);
  },
  update: async (id, data) => {
    return apiClient.put(`/patterns/${id}`, data);
  },
  delete: async (id) => {
    return apiClient.delete(`/patterns/${id}`);
  }
};

// Сервис для работы с контентом
export const contentService = {
  getAll: async (type) => {
    return apiClient.get(`/content?type=${type}`);
  },
  getById: async (id) => {
    return apiClient.get(`/content/${id}`);
  },
  create: async (data) => {
    return apiClient.post('/content', data);
  },
  update: async (id, data) => {
    return apiClient.put(`/content/${id}`, data);
  },
  delete: async (id) => {
    return apiClient.delete(`/content/${id}`);
  }
};

// Сервис для работы с настройками
export const settingsService = {
  get: async () => {
    return apiClient.get('/settings');
  },
  update: async (data) => {
    return apiClient.put('/settings', data);
  }
};

export default {
  auth: authService,
  patterns: patternsService,
  content: contentService,
  settings: settingsService
};