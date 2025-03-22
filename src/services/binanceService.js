// src/services/binanceService.js
import axios from 'axios';

// Базовый URL для Binance API
const BINANCE_API_URL = 'https://api.binance.com/api/v3';

// Создаем экземпляр axios с базовым URL
const binanceClient = axios.create({
  baseURL: BINANCE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Сервис для работы с Binance API
const binanceService = {
  // Получение текущей цены для одного символа
  getPrice: async (symbol) => {
    try {
      const response = await binanceClient.get('/ticker/price', {
        params: { symbol: symbol }
      });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении цены для ${symbol}:`, error);
      throw error;
    }
  },
  
  // Получение цен для всех символов
  getAllPrices: async () => {
    try {
      const response = await binanceClient.get('/ticker/price');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении всех цен:', error);
      throw error;
    }
  },
  
  // Получение цен для списка символов
  getPricesForSymbols: async (symbols) => {
    try {
      // Binance API не поддерживает запрос нескольких символов одновременно
      // поэтому делаем запросы параллельно и собираем результаты
      const promises = symbols.map(symbol => 
        binanceClient.get('/ticker/price', { params: { symbol } })
          .then(response => response.data)
          .catch(error => {
            console.error(`Ошибка при получении цены для ${symbol}:`, error);
            return { symbol, price: null }; // Возвращаем null в случае ошибки
          })
      );
      
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Ошибка при получении цен для символов:', error);
      throw error;
    }
  },
  
  // Получение 24-часового изменения цены
  get24hChange: async (symbol) => {
    try {
      const response = await binanceClient.get('/ticker/24hr', {
        params: { symbol: symbol }
      });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении изменения цены для ${symbol}:`, error);
      throw error;
    }
  },
  
  // Получение 24-часового изменения цены для списка символов
  get24hChangeForSymbols: async (symbols) => {
    try {
      const promises = symbols.map(symbol => 
        binanceClient.get('/ticker/24hr', { params: { symbol } })
          .then(response => response.data)
          .catch(error => {
            console.error(`Ошибка при получении изменения цены для ${symbol}:`, error);
            return { symbol, priceChangePercent: null }; // Возвращаем null в случае ошибки
          })
      );
      
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Ошибка при получении изменений цен для символов:', error);
      throw error;
    }
  }
};

export default binanceService;