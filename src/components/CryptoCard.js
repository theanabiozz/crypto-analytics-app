import React, { memo } from 'react';
import ChartPlaceholder from './ChartPlaceholder';

// Форматирование цены для начального рендеринга
const formatPrice = (price) => {
  // Преобразуем в число, если price не является числом
  const numPrice = parseFloat(price);
  
  // Проверяем, что numPrice действительно число (не NaN)
  if (isNaN(numPrice)) {
    return "0.00"; // Значение по умолчанию, если price невалидный
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

// Функция сравнения для memo - игнорируем изменения цены
const arePropsEqual = (prevProps, nextProps) => {
  return (
    prevProps.crypto.id === nextProps.crypto.id &&
    prevProps.isFavorite === nextProps.isFavorite
  );
};

const CryptoCard = ({ crypto, isFavorite, onToggleFavorite }) => {
  // Проверка на существование crypto
  if (!crypto) {
    console.warn('CryptoCard: получен undefined или null объект crypto');
    return null;
  }

  // Деструктуризация объекта crypto с дефолтными значениями
  const {
    name = 'Неизвестная криптовалюта',
    ticker = '???',
    price = 0,
    priceChange = 0,
    patternType = 'neutral',
    patternName = 'Паттерн не определен',
    patternLabel = 'Неизвестный',
    description = 'Описание отсутствует',
    timestamp = ''
  } = crypto;

  // Безопасное получение объекта levels (с проверкой на существование)
  const levels = crypto.levels || {};

  // Определение класса для отображения изменения цены
  const priceChangeClass = parseFloat(priceChange) >= 0 ? 'price-up' : 'price-down';
  
  // Определение знака перед изменением цены
  const priceChangeSign = parseFloat(priceChange) >= 0 ? '+' : '';
  
  // Определение класса для типа паттерна
  const patternClass = patternType === 'bullish' ? 'bullish' : 
                      patternType === 'bearish' ? 'bearish' : 'neutral';
                      
  // Создаем уникальный идентификатор для обновления цены
  const priceSymbol = ticker ? `${ticker.toUpperCase()}USDT` : '';

  return (
    <div className="crypto-card">
      <div className="card-header">
        <div className="coin-info">
          <div className="coin-icon">{ticker ? ticker.charAt(0) : '?'}</div>
          <div>
            <span className="coin-name">{name || 'Неизвестно'}</span>
            <span className="coin-ticker">{ticker || '???'}</span>
          </div>
        </div>
        <div 
          className="price-info"
          data-price-container
          data-symbol={priceSymbol}
        >
          <div className="coin-price js-crypto-price">
            ${formatPrice(price)}
          </div>
          <span className={`price-change ${priceChangeClass} js-crypto-change`}>
            {priceChangeSign}{formatPrice(Math.abs(parseFloat(priceChange)))}%
          </span>
        </div>
      </div>
      <div className="chart-container">
        <ChartPlaceholder coinId={ticker || 'unknown'} patternType={patternType || 'neutral'} />
        <div className={`pattern-label ${patternClass}`}>{patternLabel || 'Неизвестный'}</div>
      </div>
      <div className="card-body">
        <div className="pattern-name">{patternName || 'Неизвестный паттерн'}</div>
        <div className="pattern-description">{description || 'Описание отсутствует'}</div>
        <div className="key-levels">
          {levels && levels.resistance && (
            <div className="level">
              <div className="level-value">{formatPrice(levels.resistance)}</div>
              <div className="level-label">Сопротивление</div>
            </div>
          )}
          {levels && levels.support && (
            <div className="level">
              <div className="level-value">{formatPrice(levels.support)}</div>
              <div className="level-label">Поддержка</div>
            </div>
          )}
          {levels && levels.potential && (
            <div className="level">
              <div className="level-value">
                {parseFloat(levels.potential) >= 0 ? '+' : ''}{levels.potential}%
              </div>
              <div className="level-label">Потенциал</div>
            </div>
          )}
          {levels && levels.timeframe && (
            <div className="level">
              <div className="level-value">{levels.timeframe}</div>
              <div className="level-label">Срок</div>
            </div>
          )}
        </div>
        <div className="timestamp">
          {timestamp || 'Нет данных о времени'}
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

// Экспортируем мемоизированный компонент
export default memo(CryptoCard, arePropsEqual);