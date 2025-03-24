// migrate-data.js - Скрипт для миграции данных из JSON в MongoDB
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Загрузка переменных окружения
dotenv.config();

// Подключение к MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto_patterns';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB успешно подключен'))
  .catch(err => {
    console.error('Ошибка подключения к MongoDB:', err);
    process.exit(1);
  });

// Импорт моделей
const Pattern = require('./models/Pattern');
const User = require('./models/User');
const Favorite = require('./models/Favorite');
const Upload = require('./models/Upload');

// Путь к JSON файлу с данными
const DB_JSON_PATH = path.join(__dirname, 'db.json');

// Функция для чтения данных из JSON файла
const readJSONData = () => {
  try {
    const rawData = fs.readFileSync(DB_JSON_PATH, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Ошибка чтения JSON файла:', error);
    return null;
  }
};

// Функция для миграции данных
const migrateData = async () => {
  try {
    // Чтение данных из JSON
    const jsonData = readJSONData();
    if (!jsonData) {
      console.error('Не удалось прочитать данные из JSON файла');
      return;
    }

    console.log('Данные успешно прочитаны из JSON файла');

    // Чистим существующие коллекции (опционально)
    await Pattern.deleteMany({});
    await User.deleteMany({});
    await Favorite.deleteMany({});
    await Upload.deleteMany({});

    console.log('Существующие коллекции очищены');

    // Миграция паттернов
    if (jsonData.patterns && Array.isArray(jsonData.patterns)) {
      console.log(`Начинаем миграцию ${jsonData.patterns.length} паттернов...`);
      
      const patternPromises = jsonData.patterns.map(async (pattern) => {
        // Преобразуем формат данных, если необходимо
        const newPattern = {
          ...pattern,
          // Добавляем title, если его нет
          title: pattern.title || pattern.patternName || `${pattern.name || 'Неизвестно'} (${pattern.ticker || 'N/A'})`,
          // Добавляем name, если его нет
          name: pattern.name || 'Неизвестная валюта',
          // Добавляем ticker, если его нет
          ticker: pattern.ticker || 'XXX',
          // Добавляем price, если его нет
          price: pattern.price || 0,
          // Добавляем priceChange, если его нет
          priceChange: pattern.priceChange || 0,
          // Убедимся, что date поля имеют правильный формат
          createdAt: new Date(pattern.createdAt || Date.now()),
          updatedAt: new Date(pattern.updatedAt || Date.now())
        };
        
        try {
          const savedPattern = await new Pattern(newPattern).save();
          console.log(`Паттерн ${newPattern.title} успешно сохранен`);
          return savedPattern;
        } catch (error) {
          console.error(`Ошибка при сохранении паттерна ${newPattern.title || 'неизвестно'}:`, error);
          return null;
        }
      });
      
      const results = await Promise.allSettled(patternPromises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;
      
      console.log(`Паттерны успешно мигрированы: ${successCount} успешно, ${failCount} с ошибками`);
    }

    // Миграция пользователей
    if (jsonData.users && Array.isArray(jsonData.users)) {
      console.log(`Начинаем миграцию ${jsonData.users.length} пользователей...`);
      
      const userPromises = jsonData.users.map(async (user) => {
        try {
          // Хешируем пароль
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(user.password, salt);
          
          const newUser = new User({
            username: user.username,
            email: user.email || `${user.username}@example.com`, // Добавляем email если отсутствует
            password: hashedPassword,
            role: user.role || 'user',
            createdAt: new Date(user.createdAt || Date.now())
          });
          
          return newUser.save();
        } catch (error) {
          console.error(`Ошибка при сохранении пользователя ${user.username}:`, error);
          return null;
        }
      });
      
      await Promise.allSettled(userPromises);
      console.log('Пользователи успешно мигрированы');
    }

    // Получаем ID пользователей после миграции
    const users = await User.find({});
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user.username, user._id);
    });

    // Миграция избранного
    if (jsonData.favorites && Array.isArray(jsonData.favorites)) {
      console.log(`Начинаем миграцию ${jsonData.favorites.length} записей избранного...`);
      
      const favoritePromises = jsonData.favorites.map(async (favorite) => {
        try {
          // Найдем ID пользователя
          const userId = userMap.get('admin') || (users.length > 0 ? users[0]._id : null);
          
          if (!userId) {
            console.warn(`Не найден пользователь для избранного ${favorite.patternId}`);
            return null;
          }
          
          const newFavorite = new Favorite({
            userId: userId,
            patternId: favorite.patternId,
            createdAt: new Date(favorite.createdAt || Date.now())
          });
          
          return newFavorite.save();
        } catch (error) {
          console.error(`Ошибка при сохранении избранного для паттерна ${favorite.patternId}:`, error);
          return null;
        }
      });
      
      await Promise.allSettled(favoritePromises);
      console.log('Избранное успешно мигрировано');
    }

    // Миграция загрузок
    if (jsonData.uploads && Array.isArray(jsonData.uploads)) {
      console.log(`Начинаем миграцию ${jsonData.uploads.length} загрузок...`);
      
      const uploadPromises = jsonData.uploads.map(async (upload) => {
        try {
          const newUpload = new Upload({
            originalName: upload.originalName || 'unknown.jpg',
            path: upload.path || '/uploads/default.jpg',
            type: upload.type || 'image/jpeg',
            size: upload.size || 0,
            createdAt: new Date(upload.createdAt || Date.now())
          });
          
          return newUpload.save();
        } catch (error) {
          console.error(`Ошибка при сохранении загрузки ${upload.originalName || 'unknown'}:`, error);
          return null;
        }
      });
      
      await Promise.allSettled(uploadPromises);
      console.log('Загрузки успешно мигрированы');
    }

    console.log('Миграция данных успешно завершена');
  } catch (error) {
    console.error('Ошибка при миграции данных:', error);
  } finally {
    // Закрываем соединение с MongoDB
    await mongoose.disconnect();
    console.log('Соединение с MongoDB закрыто');
  }
};

// Запускаем миграцию
migrateData();