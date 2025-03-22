import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Button, CircularProgress } from '@mui/material';
import './App.css';
import './assets/styles/index.css';

// Компоненты публичной части
import Header from './components/Header';
import Subtitle from './components/Subtitle';
import CryptoCard from './components/CryptoCard';
import Navigation from './components/Navigation';
import Home from './pages/Home';

// Импорт компонентов админ-панели
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ContentManager from './pages/admin/ContentManager';
import PatternEditor from './pages/admin/PatternEditor';

// Сервисы и данные
import telegramService from './services/telegramService';
import { patternsService, favoritesService } from './services/databaseService';

// Импорт контекста аутентификации
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Компонент защищенного маршрута
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Если все еще загружается, показываем заглушку
  if (loading) {
    return <div>Загрузка...</div>;
  }
  
  // Если не аутентифицирован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Основное приложение Telegram
const TelegramApp = () => {
  // Состояние для хранения активной вкладки
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Состояние для хранения данных криптовалют
  const [cryptoList, setCryptoList] = useState([]);
  
  // Состояние для хранения избранных криптовалют
  const [favorites, setFavorites] = useState([]);

  // Состояние для загрузки
  const [loading, setLoading] = useState(false);
  // Состояние для ошибки
  const [error, setError] = useState(null);
  
  // Дата последнего обновления
  const [lastUpdate, setLastUpdate] = useState('14 марта 2025, 13:03');

  // Функция обновления данных
  const refreshData = async () => {
    console.log("Начало запроса к API...");
    setLoading(true);
    setError(null);
    
    try {
      // Получаем паттерны из API вместо localStorage
      console.log("Вызываем patternsService.getUserPatterns()");
      const response = await patternsService.getUserPatterns();
      console.log('Ответ от API:', response);
      
      if (response && response.data) {
        console.log('Данные из API:', response.data);
        setCryptoList(response.data);
        
        // Устанавливаем дату последнего обновления
        setLastUpdate(new Date().toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) + ', ' + new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        }));
        
        // Получаем избранное из API
        const userId = 1; // Временно для демонстрации
        console.log("Получаем избранное для пользователя:", userId);
        const favoritesResponse = await favoritesService.getUserFavorites(userId);
        console.log('Ответ избранного от API:', favoritesResponse);
        
        if (favoritesResponse && favoritesResponse.data) {
          const favoriteIds = favoritesResponse.data.map(f => f.patternId);
          console.log("ID избранных элементов:", favoriteIds);
          setFavorites(favoriteIds);
        } else {
          console.log("Нет данных по избранному или ответ некорректный");
        }
      } else {
        console.error("Ответ API не содержит данных:", response);
        setError("Получен пустой ответ от API");
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError(`Не удалось загрузить данные: ${err.message}`);
    } finally {
      setLoading(false);
      console.log("Запрос к API завершен");
    }
  };

  // Загружаем данные при первом рендере и настраиваем слушатели событий
  useEffect(() => {
    console.log("Компонент TelegramApp смонтирован");
    
    // Инициализируем Telegram WebApp
    telegramService.init();
    
    // Загружаем данные из API
    refreshData();
    
    // Добавляем обработчик для ручного обновления (если понадобится)
    const refreshInterval = setInterval(() => {
      console.log("Запускаем автоматическое обновление данных");
      refreshData();
    }, 5 * 60 * 1000); // Обновление каждые 5 минут
    
    // Очистка интервала при размонтировании компонента
    return () => {
      console.log("Компонент TelegramApp размонтирован");
      clearInterval(refreshInterval);
    };
  }, []);

  // Функция для добавления или удаления из избранного
  const toggleFavorite = async (cryptoId) => {
    try {
      const userId = 1; // Временно для демонстрации
      
      if (favorites.includes(cryptoId)) {
        // Удаляем из избранного через API
        console.log("Удаляем из избранного:", cryptoId);
        await favoritesService.removeFromFavorites(userId, cryptoId);
        setFavorites(favorites.filter(id => id !== cryptoId));
      } else {
        // Добавляем в избранное через API
        console.log("Добавляем в избранное:", cryptoId);
        await favoritesService.addToFavorites(userId, cryptoId);
        setFavorites([...favorites, cryptoId]);
      }
    } catch (err) {
      console.error('Ошибка при обновлении избранного:', err);
    }
  };

  // Фильтрация данных в зависимости от активной вкладки
  const getFilteredCryptoList = () => {
    console.log("Фильтрация данных для вкладки:", activeTab);
    console.log("Текущие данные:", cryptoList);
    console.log("Избранное:", favorites);
    
    switch (activeTab) {
      case 'favorites':
        return cryptoList.filter(crypto => favorites.includes(crypto.id));
      case 'analytics':
      default:
        return cryptoList;
    }
  };

  // Рендеринг контента в зависимости от активной вкладки
  const renderContent = () => {
    // Если идет загрузка, показываем индикатор
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh'
        }}>
          <CircularProgress />
        </Box>
      );
    }
    
    // Если есть ошибка, показываем сообщение
    if (error) {
      return (
        <Box sx={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          color: 'error.main'
        }}>
          <p>{error}</p>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={refreshData} 
            sx={{ mt: 2 }}
          >
            Попробовать снова
          </Button>
        </Box>
      );
    }
    
    switch (activeTab) {
      case 'analytics':
      case 'favorites':
        const filteredList = getFilteredCryptoList();
        console.log("Отфильтрованный список:", filteredList);
        
        return filteredList.length > 0 ? (
          filteredList.map(crypto => (
            <CryptoCard 
              key={crypto.id} 
              crypto={crypto} 
              isFavorite={favorites.includes(crypto.id)}
              onToggleFavorite={() => toggleFavorite(crypto.id)}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--tg-theme-hint-color)' }}>
            {activeTab === 'favorites' 
              ? 'У вас пока нет избранных монет' 
              : 'Нет доступных данных'}
          </div>
        );
      
      case 'notifications':
        return (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--tg-theme-hint-color)' }}>
            Уведомления появятся здесь
          </div>
        );
      
      case 'settings':
        return (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--tg-theme-hint-color)' }}>
            Настройки будут доступны в ближайшее время
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <Header />
      
      {(activeTab === 'analytics' || activeTab === 'favorites') && (
        <Subtitle 
          lastUpdate={lastUpdate} 
          onRefresh={refreshData}
          isLoading={loading}
        />
      )}
      
      {renderContent()}
      
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Маршрут для основного приложения Telegram */}
          <Route path="/" element={<TelegramApp />} />

          {/* Публичный маршрут для страницы сайта */}
          <Route path="/web" element={<Home />} />
          
          {/* Маршруты админ-панели */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/content" 
            element={
              <ProtectedRoute>
                <ContentManager />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/patterns/new" 
            element={
              <ProtectedRoute>
                <PatternEditor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/patterns/:id" 
            element={
              <ProtectedRoute>
                <PatternEditor />
              </ProtectedRoute>
            } 
          />
          {/* Дополнительные маршруты админ-панели можно добавить здесь */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;