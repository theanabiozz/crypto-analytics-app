import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, IconButton, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import { patternsService, favoritesService } from '../services/databaseService';
import binanceService from '../services/binanceService';
import axios from 'axios';

const PatternDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [pattern, setPattern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Загрузка данных паттерна
  useEffect(() => {
    const fetchPattern = async () => {
      setLoading(true);
      try {
        // Используем axios напрямую, чтобы обойти проблемы с прокси
        const response = await axios.get(`http://localhost:3001/api/patterns/${id}`);
        
        if (response && response.data) {
          let patternData = response.data;
          
          // Получаем актуальную цену из Binance
          if (patternData.ticker) {
            try {
              const symbol = patternData.ticker.toUpperCase() + 'USDT';
              const priceData = await binanceService.getPrice(symbol);
              const changeData = await binanceService.get24hChange(symbol);
              
              if (priceData && priceData.price) {
                patternData = {
                  ...patternData,
                  price: parseFloat(priceData.price),
                  priceChange: changeData && changeData.priceChangePercent ? 
                    parseFloat(changeData.priceChangePercent) : 
                    patternData.priceChange
                };
              }
            } catch (error) {
              console.error("Ошибка при получении цен из Binance:", error);
            }
          }
          
          setPattern(patternData);
          
          // Проверяем, находится ли паттерн в избранном
          const userId = 1; // Временно для демонстрации
          const favoritesResponse = await favoritesService.getUserFavorites(userId);
          
          if (favoritesResponse && favoritesResponse.data) {
            const favoriteIds = favoritesResponse.data.map(f => f.patternId);
            setIsFavorite(favoriteIds.includes(id));
          }
        } else {
          setError("Паттерн не найден");
        }
      } catch (err) {
        console.error("Ошибка при загрузке паттерна:", err);
        setError("Ошибка при загрузке данных: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPattern();
  }, [id]);
  
  // Функция для форматирования цены
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    
    if (isNaN(numPrice)) {
      return "0.00";
    }
    
    if (numPrice < 0.0001) {
      return numPrice.toFixed(8);
    } else if (numPrice < 0.01) {
      return numPrice.toFixed(6);
    } else if (numPrice < 1) {
      return numPrice.toFixed(4);
    } else if (numPrice < 100) {
      return numPrice.toFixed(2);
    } else if (numPrice < 10000) {
      return numPrice.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
    } else {
      return numPrice.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
    }
  };
  
  // Добавление/удаление из избранного
  const toggleFavorite = async () => {
    try {
      const userId = 1; // Временно для демонстрации
      
      if (isFavorite) {
        // Удаляем из избранного
        await favoritesService.removeFromFavorites(userId, id);
        setIsFavorite(false);
      } else {
        // Добавляем в избранное
        await favoritesService.addToFavorites(userId, id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Ошибка при обновлении избранного:", err);
    }
  };
  
  // Функция для определения класса типа паттерна
  const getPatternTypeClass = (type) => {
    switch (type) {
      case 'bullish': return 'bullish';
      case 'bearish': return 'bearish';
      default: return 'neutral';
    }
  };
  
  // Обработчик кнопки назад
  const handleBack = () => {
    navigate(-1); // Возврат на предыдущую страницу
  };
  
  // Если загрузка, показываем индикатор
  if (loading) {
    return (
      <Box className="pattern-details-container loading">
        <CircularProgress sx={{ margin: 'auto' }} />
      </Box>
    );
  }
  
  // Если ошибка, показываем сообщение
  if (error) {
    return (
      <Box className="pattern-details-container error">
        <div className="back-button">
          <IconButton onClick={handleBack} aria-label="back">
            <ArrowBackIcon />
          </IconButton>
        </div>
        <div className="error-message">{error}</div>
      </Box>
    );
  }
  
  // Если данные загружены, показываем детали паттерна
  if (pattern) {
    const patternTypeClass = getPatternTypeClass(pattern.patternType);
    const priceChangeClass = parseFloat(pattern.priceChange) >= 0 ? 'price-up' : 'price-down';
    const priceChangeSign = parseFloat(pattern.priceChange) >= 0 ? '+' : '';
    
    return (
      <div className="pattern-details-container">
        {/* Верхняя панель */}
        <div className="details-header">
          <IconButton onClick={handleBack} aria-label="back" className="back-button">
            <ArrowBackIcon />
          </IconButton>
          <h1 className="details-title">{pattern.name || 'Неизвестная криптовалюта'} <span className="ticker">{pattern.ticker || '???'}</span></h1>
          <IconButton onClick={toggleFavorite} aria-label="favorite" className="favorite-button">
            {isFavorite ? <StarIcon style={{ color: '#ffcc00' }} /> : <StarBorderIcon />}
          </IconButton>
        </div>
        
        {/* Информация о цене */}
        <div className="details-price-info">
          <div className="current-price">${formatPrice(pattern.price)}</div>
          <div className={`price-change ${priceChangeClass}`}>
            {priceChangeSign}{formatPrice(Math.abs(parseFloat(pattern.priceChange)))}%
          </div>
        </div>
        
        {/* График */}
        <div className="details-chart">
          {pattern.chartImageUrl ? (
            <img 
              src={pattern.chartImageUrl.startsWith('http') 
                ? pattern.chartImageUrl 
                : `http://localhost:3001${pattern.chartImageUrl.startsWith('/') ? '' : '/'}${pattern.chartImageUrl}`} 
              alt={`График ${pattern.ticker}`} 
              className="chart-image"
              onError={(e) => {
                console.error("Ошибка загрузки изображения:", e);
                e.target.onerror = null; 
                e.target.src = ""; // Пустой src
                e.target.style.display = "none"; // Скрываем изображение при ошибке
                e.target.parentNode.classList.add("chart-placeholder", patternTypeClass);
                e.target.parentNode.textContent = `График ${pattern.ticker || 'Неизвестно'} (ошибка загрузки)`;
              }}
            />
          ) : (
            <div className={`chart-placeholder ${patternTypeClass}`}>
              График {pattern.ticker || 'Неизвестно'}
            </div>
          )}
          <div className={`chart-pattern-label ${patternTypeClass}`}>
            {pattern.patternLabel || 'Неизвестный'}
          </div>
        </div>
        
        {/* Название паттерна */}
        <div className="details-pattern-name">
          <h2>{pattern.patternName || pattern.title || 'Неизвестный паттерн'}</h2>
          <Chip 
            label={pattern.patternType === 'bullish' ? 'Бычий' : pattern.patternType === 'bearish' ? 'Медвежий' : 'Нейтральный'} 
            className={`pattern-type-chip ${patternTypeClass}`}
          />
        </div>
        
        {/* Описание паттерна */}
        <div className="details-description">
          <p>{pattern.description || 'Описание отсутствует'}</p>
        </div>
        
        {/* Ключевые уровни */}
        <div className="details-key-levels">
          <h3>Ключевые уровни</h3>
          <div className="key-levels-grid">
            {pattern.levels?.resistance && (
              <div className="level-box">
                <div className="level-value">{formatPrice(pattern.levels.resistance)}</div>
                <div className="level-label">Сопротивление</div>
              </div>
            )}
            {pattern.levels?.support && (
              <div className="level-box">
                <div className="level-value">{formatPrice(pattern.levels.support)}</div>
                <div className="level-label">Поддержка</div>
              </div>
            )}
            {pattern.levels?.potential && (
              <div className="level-box">
                <div className="level-value">
                  {parseFloat(pattern.levels.potential) >= 0 ? '+' : ''}{pattern.levels.potential}%
                </div>
                <div className="level-label">Потенциал</div>
              </div>
            )}
            {pattern.levels?.timeframe && (
              <div className="level-box">
                <div className="level-value">{pattern.levels.timeframe}</div>
                <div className="level-label">Срок</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Дополнительная информация */}
        <div className="details-additional-info">
          <p className="timestamp">Обновлено: {pattern.updatedAt ? new Date(pattern.updatedAt).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'Неизвестно'}</p>
        </div>
      </div>
    );
  }
  
  return null;
};

export default PatternDetails;