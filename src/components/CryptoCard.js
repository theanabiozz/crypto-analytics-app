import React from 'react';
import ChartPlaceholder from './ChartPlaceholder';

// Форматирование цены в зависимости от значения
const formatPrice = (price) => {
  if (price < 0.001) {
    return price.toFixed(8);
  } else if (price < 1) {
    return price.toFixed(4);
  } else if (price < 100) {
    return price.toFixed(2);
  } else {
    return price.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
  }
};

const CryptoCard = ({ crypto, isFavorite, onToggleFavorite }) => {
  // Проверка на существование crypto
  if (!crypto) {
    return null;
  }

  // Деструктуризация объекта crypto
  const {
    name,
    ticker,
    price,
    priceChange,
    patternType,
    patternName,
    patternLabel,
    description,
    timestamp
  } = crypto;

  // Безопасное получение объекта levels (с проверкой на существование)
  const levels = crypto.levels || {};

  // Определение класса для отображения изменения цены
  const priceChangeClass = priceChange >= 0 ? 'price-up' : 'price-down';
  
  // Определение знака перед изменением цены
  const priceChangeSign = priceChange >= 0 ? '+' : '';
  
  // Определение класса для типа паттерна
  const patternClass = patternType === 'bullish' ? 'bullish' : 'bearish';

  return (
    <div className="crypto-card">
      <div className="card-header">
        <div className="coin-info">
          <div className="coin-icon">{ticker.charAt(0)}</div>
          <div>
            <span className="coin-name">{name}</span>
            <span className="coin-ticker">{ticker}</span>
          </div>
        </div>
        <div className="price-info">
          <div className="coin-price">${formatPrice(price)}</div>
          <span className={`price-change ${priceChangeClass}`}>
            {priceChangeSign}{priceChange}%
          </span>
        </div>
      </div>
      <div className="chart-container">
        <ChartPlaceholder coinId={ticker} patternType={patternType} />
        <div className={`pattern-label ${patternClass}`}>{patternLabel}</div>
      </div>
      <div className="card-body">
        <div className="pattern-name">{patternName}</div>
        <div className="pattern-description">{description}</div>
        <div className="key-levels">
          {levels.resistance && (
            <div className="level">
              <div className="level-value">{formatPrice(levels.resistance)}</div>
              <div className="level-label">Сопротивление</div>
            </div>
          )}
          {levels.support && (
            <div className="level">
              <div className="level-value">{formatPrice(levels.support)}</div>
              <div className="level-label">Поддержка</div>
            </div>
          )}
          {levels.potential && (
            <div className="level">
              <div className="level-value">
                {levels.potential >= 0 ? '+' : ''}{levels.potential}%
              </div>
              <div className="level-label">Потенциал</div>
            </div>
          )}
          {levels.timeframe && (
            <div className="level">
              <div className="level-value">{levels.timeframe}</div>
              <div className="level-label">Срок</div>
            </div>
          )}
        </div>
        <div className="timestamp">
          {timestamp}
          <span 
            style={{ 
              marginLeft: '10px', 
              cursor: 'pointer',
              fontSize: '16px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleFavorite) onToggleFavorite();
            }}
          >
            {isFavorite ? '⭐' : '☆'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CryptoCard;