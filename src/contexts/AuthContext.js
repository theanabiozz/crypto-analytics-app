import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';  // Обратите внимание на изменение импорта

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверка токена при загрузке
    const token = localStorage.getItem('token');
    console.log('Токен из localStorage:', token ? 'Есть токен' : 'Токен отсутствует');
    
    if (token) {
      try {
        const decoded = jwtDecode(token);  // Используем jwtDecode вместо jwt_decode
        const currentTime = Date.now() / 1000;
        
        console.log('Информация о токене:', {
          exp: decoded.exp,
          currentTime: currentTime,
          isValid: decoded.exp > currentTime
        });
        
        if (decoded.exp > currentTime) {
          setCurrentUser(decoded);
          setIsAuthenticated(true);
        } else {
          // Токен истек
          console.log('Токен истек, удаляем');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Некорректный токен', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, user) => {
    console.log('Вход выполнен, сохраняем токен и данные пользователя:', { user });
    localStorage.setItem('token', token);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log('Выход из системы, удаляем токен');
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};