import React from 'react';

const ChartPlaceholder = ({ coinId, patternType }) => {
  // В будущем этот компонент будет заменен на реальный график
  // Пока просто показываем разные цвета в зависимости от типа паттерна
  
  const gradientStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    background: patternType === 'bullish'
      ? 'linear-gradient(180deg, rgba(76,217,100,0.1) 0%, rgba(76,217,100,0.05) 100%)'
      : 'linear-gradient(180deg, rgba(255,59,48,0.1) 0%, rgba(255,59,48,0.05) 100%)'
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
        График {coinId.toUpperCase()}
      </div>
    </div>
  );
};

export default ChartPlaceholder;