// Модуль для обновления цен без использования React
const priceUpdater = {
    // Хранилище для цен: { "BTCUSDT": { price: 50000, priceChange: 2.5 }, ... }
    prices: {},
    
    // Интервал обновления
    updateInterval: null,
    
    // API-сервис для Binance
    binanceService: null,
    
    // Функция форматирования цены
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
    },
    
    // Инициализация обновления цен
    init(binanceService, updateCallback) {
      this.binanceService = binanceService;
      this.updateCallback = updateCallback;
      
      // Остановим существующие интервалы, если они есть
      this.stop();
      
      // Запускаем обновление цен каждые 5 секунд
      this.updateInterval = setInterval(() => {
        this.updatePrices();
      }, 5000);
      
      // Обновляем цены сразу
      this.updatePrices();
      
      // Слушаем создание новых карточек
      this.observeDOMChanges();
      
      return this;
    },
    
    // Остановить обновление цен
    stop() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    },
    
    // Следим за изменениями DOM и обновляем новые элементы
    observeDOMChanges() {
      // Используем MutationObserver для отслеживания новых элементов
      const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            // Проверяем, есть ли новые элементы с ценами
            const priceElements = document.querySelectorAll('[data-price-container]');
            if (priceElements.length > 0) {
              shouldUpdate = true;
            }
          }
        });
        
        if (shouldUpdate) {
          // Обновляем цены для новых элементов
          this.updateDisplayedPrices();
        }
      });
      
      // Начинаем наблюдение за DOM
      observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
    },
    
    // Обновление цен из API Binance
    async updatePrices() {
      if (!this.binanceService) return;
      
      try {
        // Получаем все элементы с ценами на странице
        const priceContainers = document.querySelectorAll('[data-price-container]');
        if (priceContainers.length === 0) return;
        
        // Собираем все уникальные символы
        const symbols = new Set();
        priceContainers.forEach(container => {
          const symbol = container.getAttribute('data-symbol');
          if (symbol) symbols.add(symbol);
        });
        
        if (symbols.size === 0) return;
        
        // Получаем данные из Binance
        const symbolsArray = Array.from(symbols);
        const pricesData = await this.binanceService.getPricesForSymbols(symbolsArray);
        const changeData = await this.binanceService.get24hChangeForSymbols(symbolsArray);
        
        // Обрабатываем полученные данные
        let hasChanges = false;
        
        symbolsArray.forEach(symbol => {
          const priceInfo = pricesData.find(p => p.symbol === symbol);
          const changeInfo = changeData.find(c => c.symbol === symbol);
          
          if (priceInfo && priceInfo.price) {
            const newPrice = parseFloat(priceInfo.price);
            const newPriceChange = changeInfo && changeInfo.priceChangePercent ? 
              parseFloat(changeInfo.priceChangePercent) : 0;
            
            // Обновляем данные в кэше
            const currentPrice = this.prices[symbol];
            if (!currentPrice || 
                Math.abs(currentPrice.price - newPrice) > 0.000001 || 
                Math.abs(currentPrice.priceChange - newPriceChange) > 0.000001) {
              
              this.prices[symbol] = { price: newPrice, priceChange: newPriceChange };
              hasChanges = true;
            }
          }
        });
        
        // Обновляем отображаемые цены
        if (hasChanges) {
          this.updateDisplayedPrices();
          
          // Вызываем коллбэк обновления времени
          if (this.updateCallback) {
            this.updateCallback();
          }
        }
      } catch (error) {
        console.error('Ошибка при обновлении цен:', error);
      }
    },
    
    // Обновляем цены на странице
    updateDisplayedPrices() {
      // Обновляем все контейнеры с ценами
      const priceContainers = document.querySelectorAll('[data-price-container]');
      
      priceContainers.forEach(container => {
        const symbol = container.getAttribute('data-symbol');
        if (!symbol || !this.prices[symbol]) return;
        
        const priceData = this.prices[symbol];
        
        // Находим элементы внутри контейнера
        const priceElement = container.querySelector('.js-crypto-price');
        const changeElement = container.querySelector('.js-crypto-change');
        
        // Обновляем цену
        if (priceElement) {
          priceElement.textContent = '$' + this.formatPrice(priceData.price);
        }
        
        // Обновляем изменение цены
        if (changeElement) {
          const isPositive = priceData.priceChange >= 0;
          const sign = isPositive ? '+' : '';
          changeElement.textContent = `${sign}${this.formatPrice(Math.abs(priceData.priceChange))}%`;
          
          // Обновляем класс
          changeElement.classList.remove('price-up', 'price-down');
          changeElement.classList.add(isPositive ? 'price-up' : 'price-down');
        }
      });
    }
  };
  
  export default priceUpdater;