// src/services/localStorageService.js
const LOCAL_STORAGE_KEYS = {
    PATTERNS: 'crypto_patterns_data',
    ARTICLES: 'crypto_articles_data',
    EDUCATIONAL: 'crypto_educational_data'
  };
  
  // Получение начальных данных из cryptoAnalytics.js, если в localStorage нет данных
  const getInitialPatterns = () => {
    try {
      // Импортируем данные из файла cryptoAnalytics.js
      const cryptoData = require('../data/cryptoAnalytics').default;
      
      console.log('Importing initial data:', cryptoData);
      
      // Преобразуем формат данных для админ-панели
      return cryptoData.map(crypto => ({
        id: crypto.id,
        title: crypto.patternName || `${crypto.name} (${crypto.ticker})`,
        description: crypto.description,
        patternType: crypto.patternType,
        patternLabel: crypto.patternLabel,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        levels: crypto.levels || {},
        // Сохраняем оригинальные данные
        originalData: {
          name: crypto.name,
          ticker: crypto.ticker,
          price: crypto.price,
          priceChange: crypto.priceChange,
          timestamp: crypto.timestamp
        }
      }));
    } catch (error) {
      console.error('Error loading initial patterns:', error);
      return [];
    }
  };
  
    // Конвертация данных из админ-формата в пользовательский формат
    const convertToUserFormat = (pattern) => {
    console.log('Converting pattern to user format:', pattern);
    
    // Выделяем название криптовалюты и тикер из заголовка
    let name = pattern.title.split(' ')[0];
    let ticker = pattern.id.toUpperCase();
    
    // Если есть оригинальные данные, используем их
    if (pattern.originalData) {
      name = pattern.originalData.name || name;
      ticker = pattern.originalData.ticker || ticker;
    }
    
    // Определяем значения для сопротивления и потенциала, избегая нулевых значений
    const resistance = pattern.levels?.resistance ? parseFloat(pattern.levels.resistance) : '';
    const support = pattern.levels?.support ? parseFloat(pattern.levels.support) : '';
    const potential = pattern.levels?.potential ? parseFloat(pattern.levels.potential) : '';
    
    return {
      id: pattern.id,
      name: name,
      ticker: ticker,
      price: resistance || (pattern.originalData?.price || 0),
      priceChange: potential || (pattern.originalData?.priceChange || 0),
      patternType: pattern.patternType,
      patternName: pattern.title,
      patternLabel: pattern.patternLabel,
      description: pattern.description,
      levels: {
        resistance: resistance,
        support: support,
        potential: potential,
        timeframe: pattern.levels?.timeframe || '14 дней'
      },
      timestamp: pattern.originalData?.timestamp || new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) + ', ' + new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };
  
  const localStorageService = {
    // Получение данных из localStorage
    getData: (key) => {
      try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEYS[key]);
        
        if (!data) {
          // Если данных нет, возвращаем начальные данные для паттернов
          if (key === 'PATTERNS') {
            const initialPatterns = getInitialPatterns();
            localStorage.setItem(LOCAL_STORAGE_KEYS[key], JSON.stringify(initialPatterns));
            return initialPatterns;
          }
          return [];
        }
        
        return JSON.parse(data);
      } catch (error) {
        console.error(`Error getting ${key} from localStorage:`, error);
        return [];
      }
    },
    
    // Сохранение данных в localStorage
    saveData: (key, data) => {
      try {
        console.log(`Saving ${key} data:`, data);
        localStorage.setItem(LOCAL_STORAGE_KEYS[key], JSON.stringify(data));
        return true;
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
        return false;
      }
    },
    
    // Методы для работы с паттернами
    getPatterns: () => localStorageService.getData('PATTERNS'),
    
    savePatterns: (patterns) => {
      console.log('Saving patterns:', patterns);
      return localStorageService.saveData('PATTERNS', patterns);
    },
    
    // Получение паттернов для пользовательского интерфейса (с оригинальным форматом данных)
    getUserPatterns: () => {
      const patterns = localStorageService.getPatterns();
      console.log('Getting user patterns from storage:', patterns);
      
      // Фильтруем только опубликованные паттерны и возвращаем в формате для пользовательского интерфейса
      return patterns
        .filter(pattern => pattern.status === 'published')
        .map(convertToUserFormat);
    },
    
    // Очистка всех данных
    clearAll: () => {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PATTERNS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ARTICLES);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.EDUCATIONAL);
    },
    
    // Методы для работы со статьями и образовательными материалами
    getArticles: () => localStorageService.getData('ARTICLES'),
    saveArticles: (articles) => localStorageService.saveData('ARTICLES', articles),
    
    getEducational: () => localStorageService.getData('EDUCATIONAL'),
    saveEducational: (educational) => localStorageService.saveData('EDUCATIONAL', educational)
  };
  
  export default localStorageService;