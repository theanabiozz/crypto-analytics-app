import React, { useState, useEffect } from 'react';

const ChartPlaceholder = ({ coinId, patternType, chartImageUrl }) => {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  useEffect(() => {
    console.log(`ChartPlaceholder для ${coinId}, URL изображения:`, chartImageUrl);
    
    if (chartImageUrl) {
      // Проверяем, начинается ли URL с http(s)://
      if (chartImageUrl.startsWith('http') || chartImageUrl.startsWith('https')) {
        // Абсолютный URL - оставляем как есть
        setImageUrl(chartImageUrl);
      } else {
        // Относительный URL - добавляем базовый URL сервера
        // В режиме разработки используем порт 3001 (json-server)
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? window.location.origin 
          : 'http://localhost:3001';
        
        // Убедимся, что URL начинается с /
        const normalizedPath = chartImageUrl.startsWith('/') 
          ? chartImageUrl 
          : `/${chartImageUrl}`;
        
        const fullUrl = `${baseUrl}${normalizedPath}`;
        console.log(`Полный URL изображения: ${fullUrl}`);
        setImageUrl(fullUrl);
      }
    }
  }, [chartImageUrl, coinId]);
  
  // Обработчик ошибки загрузки изображения
  const handleImageError = (e) => {
    console.error(`Ошибка загрузки изображения для ${coinId}:`, e);
    console.error(`URL изображения с ошибкой: ${imageUrl}`);
    setImageError(true);
  };
  
  // Если есть URL изображения и нет ошибки, пытаемся отобразить изображение
  if (imageUrl && !imageError) {
    return (
      <div className="real-chart-container" style={{ 
        width: '100%', 
        height: '100%', 
        borderRadius: '8px', 
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#1A2530'  // Темный фон для графиков
      }}>
        <img 
          src={imageUrl} 
          alt={`График ${coinId}`} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',  // Изменили с 'cover' на 'contain'
            objectPosition: 'center',
            maxHeight: '180px'  // Ограничиваем высоту для мобильных устройств
          }}
          onError={handleImageError}
        />
      </div>
    );
  }
  
  // Если нет URL или произошла ошибка, показываем плейсхолдер
  const gradientStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    background: patternType === 'bullish'
      ? 'linear-gradient(180deg, rgba(76,217,100,0.1) 0%, rgba(76,217,100,0.05) 100%)'
      : patternType === 'bearish'
        ? 'linear-gradient(180deg, rgba(255,59,48,0.1) 0%, rgba(255,59,48,0.05) 100%)'
        : 'linear-gradient(180deg, rgba(200,200,200,0.1) 0%, rgba(200,200,200,0.05) 100%)'
  };

  return (
    <div style={gradientStyle}>
      <div style={{ 
        textAlign: 'center', 
        paddingTop: '80px', 
        opacity: 0.5,
        fontSize: '14px',
        color: '#7d8b99'
      }}>
        {imageError 
          ? `Ошибка загрузки графика ${coinId}` 
          : `График ${coinId.toUpperCase()}`}
      </div>
    </div>
  );
};

export default ChartPlaceholder;