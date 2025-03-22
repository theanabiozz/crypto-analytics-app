// src/services/databaseService.js
import axios from 'axios';

// Базовый URL API - явно указываем адрес JSON Server
const API_URL = 'http://localhost:3001';
// URL для хранения загруженных изображений
const UPLOAD_URL = 'http://localhost:3001/uploads'; // В реальном проекте будет другой путь

// Создаем экземпляр axios с базовым URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Создаем отдельный экземпляр axios для загрузки файлов
const uploadClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data'
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

// Тот же перехватчик для uploadClient
uploadClient.interceptors.request.use(
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
  },
  // Метод для загрузки изображения
  uploadChartImage: async (formData) => {
    console.log('Начало загрузки изображения...');
    
    try {
      // В режиме разработки используем реальную загрузку файла через API
      // вместо имитации для демонстрации
      const response = await uploadClient.post('/upload', formData);
      console.log('Ответ от сервера при загрузке изображения:', response.data);
      
      // Проверяем, что сервер вернул URL изображения
      if (response.data && response.data.imageUrl) {
        console.log('Изображение успешно загружено, URL:', response.data.imageUrl);
        return response;
      } else {
        throw new Error('Сервер не вернул URL изображения');
      }
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
      
      // В случае ошибки, возвращаем ответ с имитацией для демонстрационных целей
      console.log('Используем имитацию из-за ошибки загрузки');
      
      return new Promise((resolve) => {
        setTimeout(() => {
          // Создаем имя файла с текущей датой
          const fileName = `chart-${Date.now()}.jpg`;
          // Возвращаем URL к "загруженному" файлу
          
          console.log('Имитация загрузки, URL:', `${UPLOAD_URL}/${fileName}`);
          
          resolve({
            data: {
              imageUrl: `/uploads/${fileName}` // Обратите внимание, что здесь используем относительный путь
            }
          });
        }, 800); // Имитация задержки загрузки
      });
    }
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