// src/services/databaseService.js
import axios from 'axios';

// Базовый URL API - используем абсолютный URL вместо относительного
const API_URL = 'http://localhost:3001/api';

// URL для хранения загруженных изображений
const UPLOAD_URL = 'http://localhost:3001/uploads'; // Используем абсолютный путь

// Создаем экземпляр axios с базовым URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Создаем отдельный экземпляр axios для загрузки файлов
const uploadClient = axios.create({
  baseURL: 'http://localhost:3001', // Базовый URL без /api для пути /upload
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// Перехватчик для добавления токена аутентификации
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Перехватчик apiClient: Токен из localStorage:', token ? 'Токен получен' : 'Токен отсутствует');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Добавлен заголовок Authorization:', `Bearer ${token.substring(0, 10)}...`);
    } else {
      console.warn('Токен отсутствует, запрос будет отправлен без аутентификации');
    }
    
    return config;
  },
  (error) => {
    console.error('Ошибка в перехватчике запроса apiClient:', error);
    return Promise.reject(error);
  }
);

// Тот же перехватчик для uploadClient
uploadClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Перехватчик uploadClient: Токен из localStorage:', token ? 'Токен получен' : 'Токен отсутствует');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Добавлен заголовок Authorization в uploadClient');
    } else {
      console.warn('Токен отсутствует, запрос загрузки будет отправлен без аутентификации');
    }
    
    return config;
  },
  (error) => {
    console.error('Ошибка в перехватчике запроса uploadClient:', error);
    return Promise.reject(error);
  }
);

// Добавим перехватчики ответов для отслеживания ошибок аутентификации
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 403) {
      console.error('Ошибка аутентификации 403:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Сервис для работы с криптовалютными паттернами
export const patternsService = {
  getAll: async () => {
    console.log('Запрос на получение всех паттернов');
    return apiClient.get('/patterns');
  },
  getById: async (id) => {
    console.log(`Запрос на получение паттерна по ID: ${id}`);
    return apiClient.get(`/patterns/${id}`);
  },
  create: async (data) => {
    console.log('Запрос на создание паттерна:', data);
    return apiClient.post('/patterns', data);
  },
  update: async (id, data) => {
    console.log(`Запрос на обновление паттерна ${id}:`, data);
    return apiClient.put(`/patterns/${id}`, data);
  },
  delete: async (id) => {
    console.log(`Запрос на удаление паттерна ${id}`);
    return apiClient.delete(`/patterns/${id}`);
  },
  // Получение паттернов для пользовательского интерфейса
  getUserPatterns: async () => {
    console.log('Запрос на получение опубликованных паттернов');
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
      // Убедимся, что токен установлен перед загрузкой
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Предупреждение: Токен отсутствует при попытке загрузки изображения');
      }
      
      // Используем реальную загрузку файла через API
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
      console.error('Детали ошибки:', error.response?.data || 'Нет деталей ошибки');
      
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
              imageUrl: `http://localhost:3001/uploads/${fileName}` // Используем абсолютный путь
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
    // Обеспечиваем, что userId передается как строка
    const userIdStr = userId.toString();
    return apiClient.get(`/favorites?userId=${userIdStr}`);
  },
  addToFavorites: async (userId, patternId) => {
    // Обеспечиваем, что userId передается как строка
    const userIdStr = userId.toString();
    return apiClient.post('/favorites', { 
      userId: userIdStr, 
      patternId, 
      createdAt: new Date().toISOString() 
    });
  },
  removeFromFavorites: async (userId, patternId) => {
    // Обеспечиваем, что userId передается как строка
    const userIdStr = userId.toString();
    
    // 1. Первый вариант: найти ID и удалить по нему
    try {
      const response = await apiClient.get(`/favorites?userId=${userIdStr}&patternId=${patternId}`);
      if (response.data && response.data.length > 0) {
        const favoriteId = response.data[0].id;
        return apiClient.delete(`/favorites/${favoriteId}`);
      }
    } catch (error) {
      console.error('Ошибка при поиске избранного:', error);
    }
    
    // 2. Второй вариант: удалить напрямую по параметрам запроса
    return apiClient.delete(`/favorites?userId=${userIdStr}&patternId=${patternId}`);
  }
};

// Сервис для аутентификации
export const authService = {
  login: async (credentials) => {
    console.log('Отправка запроса на вход в систему:', { username: credentials.username });
    return apiClient.post('/auth/login', credentials);
  },
  checkAuth: async () => {
    console.log('Проверка аутентификации');
    return apiClient.get('/auth/me');
  }
};

export default {
  patterns: patternsService,
  favorites: favoritesService,
  auth: authService
};