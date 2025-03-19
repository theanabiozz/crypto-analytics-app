import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Сервисы и данные
import telegramService from './services/telegramService';
import cryptoData from './data/cryptoAnalytics';

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
  
  // Дата последнего обновления
  const [lastUpdate, setLastUpdate] = useState('14 марта 2025, 13:03');

  useEffect(() => {
    // Инициализируем Telegram WebApp
    telegramService.init();
    
    // Загружаем данные
    setCryptoList(cryptoData);
    
    // Здесь можно загрузить избранное из localStorage или из данных бота
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Сохраняем избранное при его изменении
  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  // Функция для добавления или удаления из избранного
  const toggleFavorite = (cryptoId) => {
    if (favorites.includes(cryptoId)) {
      setFavorites(favorites.filter(id => id !== cryptoId));
    } else {
      setFavorites([...favorites, cryptoId]);
    }
  };

  // Фильтрация данных в зависимости от активной вкладки
  const getFilteredCryptoList = () => {
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
    switch (activeTab) {
      case 'analytics':
      case 'favorites':
        const filteredList = getFilteredCryptoList();
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
        <Subtitle lastUpdate={lastUpdate} />
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
          {/* Дополнительные маршруты админ-панели можно добавить здесь */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;