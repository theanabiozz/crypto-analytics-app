// Хранилище для цен криптовалют
// Это глобальное хранилище, которое не вызывает перерисовку компонентов React
const priceStore = {
    // Хранилище цен: { "BTCUSDT": { price: 50000, priceChange: 2.5 }, ... }
    prices: {},
    
    // Коллбэк для обновления последнего времени обновления
    updateLastTimeCallback: null,
    
    // Установить цену
    setPrice(symbol, price, priceChange) {
      this.prices[symbol] = { price, priceChange };
      
      // Обновляем элементы DOM напрямую, без перерисовки React
      this.updateDOMElements(symbol, price, priceChange);
    },
    
    // Получить цену
    getPrice(symbol) {
      return this.prices[symbol] || null;
    },
    
    // Получить все цены
    getAllPrices() {
      return { ...this.prices };
    },
    
    // Инициализация хранилища с начальными ценами
    initialize(initialPrices, updateLastTimeCallback) {
      this.prices = initialPrices || {};
      this.updateLastTimeCallback = updateLastTimeCallback;
    },
    
    // Обновить элементы DOM напрямую
    updateDOMElements(symbol, price, priceChange) {
      // Получаем все элементы цены для данного символа
      const priceElements = document.querySelectorAll(`[data-price-symbol="${symbol}"]`);
      const changeElements = document.querySelectorAll(`[data-change-symbol="${symbol}"]`);
      
      if (priceElements.length > 0 || changeElements.length > 0) {
        // Форматирование цены
        const formattedPrice = this.formatPrice(price);
        
        // Обновляем элементы цены
        priceElements.forEach(element => {
          element.textContent = `$${formattedPrice}`;
        });
        
        // Обновляем элементы изменения цены
        changeElements.forEach(element => {
          const sign = priceChange >= 0 ? '+' : '';
          const formattedChange = this.formatPrice(Math.abs(priceChange));
          element.textContent = `${sign}${formattedChange}%`;
          
          // Обновляем класс для стилизации (зеленый/красный)
          if (priceChange >= 0) {
            element.classList.remove('price-down');
            element.classList.add('price-up');
          } else {
            element.classList.remove('price-up');
            element.classList.add('price-down');
          }
        });
        
        // Обновляем время последнего обновления
        if (this.updateLastTimeCallback) {
          this.updateLastTimeCallback();
        }
      }
    },
    
    // Форматирование цены (та же функция, что и в CryptoCard)
    formatPrice(price) {
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
    }
  };
  
  export default priceStore;