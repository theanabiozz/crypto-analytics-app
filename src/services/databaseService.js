// src/services/databaseService.js
import axios from 'axios';

// Базовый URL API - явно указываем адрес JSON Server
const API_URL = 'http://localhost:3001';

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
  },
  // Получение паттернов для пользовательского интерфейса
  getUserPatterns: async () => {
    const params = { 
      status: 'published',
      _sort: 'updatedAt',
      _order: 'desc'
    };
    return apiClient.get('/patterns', { params });
  }
};

// Сервис для управления избранным
export const favoritesService = {
  getUserFavorites: async (userId) => {
    return apiClient.get(`/favorites?userId=${userId}`);
  },
  addToFavorites: async (userId, patternId) => {
    return apiClient.post('/favorites', { userId, patternId, createdAt: new Date().toISOString() });
  },
  removeFromFavorites: async (userId, patternId) => {
    // Сначала находим ID записи
    const response = await apiClient.get(`/favorites?userId=${userId}&patternId=${patternId}`);
    if (response.data && response.data.length > 0) {
      const favoriteId = response.data[0].id;
      return apiClient.delete(`/favorites/${favoriteId}`);
    }
    return Promise.resolve();
  }
};

export default {
  patterns: patternsService,
  favorites: favoritesService
};