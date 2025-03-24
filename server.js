// server.js - Основной файл Express сервера с MongoDB
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Загрузка переменных окружения из .env файла
dotenv.config();

// Создание Express приложения
const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto_patterns';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Создаем директорию для загрузок, если её нет
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'chart-' + uniqueSuffix + ext);
  }
});

// Создаем middleware для загрузки файлов
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB лимит
  },
  fileFilter: function (req, file, cb) {
    // Принимаем только изображения
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Только изображения разрешены к загрузке!'), false);
    }
    cb(null, true);
  }
});

// Подключение к MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB успешно подключен'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Импорт моделей
const Pattern = require('./models/Pattern');
const User = require('./models/User');
const Favorite = require('./models/Favorite');
const Upload = require('./models/Upload');

// Middleware для аутентификации JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Недействительный токен' });
      }
      
      req.user = user;
      next();
    });
  } else {
    next(); // Продолжаем для публичных маршрутов
  }
};

// Роуты для аутентификации
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Находим пользователя по имени
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
    }
    
    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
    }
    
    // Создаем JWT токен
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Отправляем токен и данные пользователя (без пароля)
    const userData = {
      id: user._id,
      username: user.username,
      role: user.role
    };
    
    res.json({ token, user: userData });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});

// Проверка аутентификации
app.get('/api/auth/me', authenticateJWT, (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Пользователь не аутентифицирован' });
  }
});

// Маршруты для паттернов
// Получение всех паттернов (публичный маршрут)
app.get('/api/patterns', async (req, res) => {
  try {
    const { status, _sort, _order } = req.query;
    
    let query = {};
    let sortOptions = {};
    
    // Фильтрация по статусу
    if (status) {
      query.status = status;
    }
    
    // Сортировка
    if (_sort && _order) {
      sortOptions[_sort] = _order === 'desc' ? -1 : 1;
    } else {
      // По умолчанию сортируем по дате обновления (новые первыми)
      sortOptions.updatedAt = -1;
    }
    
    const patterns = await Pattern.find(query).sort(sortOptions);
    res.json(patterns);
  } catch (error) {
    console.error('Ошибка при получении паттернов:', error);
    res.status(500).json({ message: 'Ошибка при получении паттернов' });
  }
});

// Получение паттерна по ID - ИСПРАВЛЕНО
app.get('/api/patterns/:id', async (req, res) => {
  try {
    let pattern = null;
    const id = req.params.id;
    
    // Сначала пробуем найти по _id (в случае если это MongoDB ObjectId)
    if (mongoose.Types.ObjectId.isValid(id)) {
      pattern = await Pattern.findById(id);
    }
    
    // Если не нашли по _id или id не является ObjectId, 
    // пробуем найти по полю id
    if (!pattern) {
      pattern = await Pattern.findOne({ id: id });
    }
    
    if (!pattern) {
      return res.status(404).json({ message: 'Паттерн не найден' });
    }
    
    res.json(pattern);
  } catch (error) {
    console.error('Ошибка при получении паттерна:', error);
    res.status(500).json({ message: 'Ошибка при получении паттерна', error: error.message });
  }
});

// Создание нового паттерна (только для аутентифицированных пользователей)
app.post('/api/patterns', authenticateJWT, async (req, res) => {
  try {
    // Проверяем, что пользователь аутентифицирован
    if (!req.user) {
      return res.status(401).json({ message: 'Требуется аутентификация' });
    }
    
    const newPattern = new Pattern(req.body);
    const savedPattern = await newPattern.save();
    
    res.status(201).json(savedPattern);
  } catch (error) {
    console.error('Ошибка при создании паттерна:', error);
    res.status(500).json({ message: 'Ошибка при создании паттерна' });
  }
});

// Обновление паттерна
app.put('/api/patterns/:id', authenticateJWT, async (req, res) => {
  try {
    // Проверяем, что пользователь аутентифицирован
    if (!req.user) {
      return res.status(401).json({ message: 'Требуется аутентификация' });
    }
    
    const updatedPattern = await Pattern.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!updatedPattern) {
      return res.status(404).json({ message: 'Паттерн не найден' });
    }
    
    res.json(updatedPattern);
  } catch (error) {
    console.error('Ошибка при обновлении паттерна:', error);
    res.status(500).json({ message: 'Ошибка при обновлении паттерна' });
  }
});

// Удаление паттерна
app.delete('/api/patterns/:id', authenticateJWT, async (req, res) => {
  try {
    // Проверяем, что пользователь аутентифицирован
    if (!req.user) {
      return res.status(401).json({ message: 'Требуется аутентификация' });
    }
    
    const deletedPattern = await Pattern.findByIdAndDelete(req.params.id);
    
    if (!deletedPattern) {
      return res.status(404).json({ message: 'Паттерн не найден' });
    }
    
    res.json({ message: 'Паттерн успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении паттерна:', error);
    res.status(500).json({ message: 'Ошибка при удалении паттерна' });
  }
});

// Маршруты для избранного
// Получение избранного для пользователя
app.get('/api/favorites', authenticateJWT, async (req, res) => {
  try {
    const userId = req.query.userId || (req.user ? req.user.id : null);
    
    if (!userId) {
      return res.status(400).json({ message: 'Не указан идентификатор пользователя' });
    }
    
    const favorites = await Favorite.find({ userId });
    res.json(favorites);
  } catch (error) {
    console.error('Ошибка при получении избранного:', error);
    res.status(500).json({ message: 'Ошибка при получении избранного' });
  }
});

// Добавление в избранное
app.post('/api/favorites', authenticateJWT, async (req, res) => {
  try {
    const { userId, patternId } = req.body;
    
    // Проверяем, что записи еще нет
    const existingFavorite = await Favorite.findOne({ userId, patternId });
    
    if (existingFavorite) {
      return res.status(400).json({ message: 'Этот паттерн уже в избранном' });
    }
    
    const newFavorite = new Favorite({
      userId,
      patternId,
      createdAt: new Date()
    });
    
    const savedFavorite = await newFavorite.save();
    res.status(201).json(savedFavorite);
  } catch (error) {
    console.error('Ошибка при добавлении в избранное:', error);
    res.status(500).json({ message: 'Ошибка при добавлении в избранное' });
  }
});

// Удаление из избранного
app.delete('/api/favorites/:id', authenticateJWT, async (req, res) => {
  try {
    const deletedFavorite = await Favorite.findByIdAndDelete(req.params.id);
    
    if (!deletedFavorite) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }
    
    res.json({ message: 'Запись успешно удалена из избранного' });
  } catch (error) {
    console.error('Ошибка при удалении из избранного:', error);
    res.status(500).json({ message: 'Ошибка при удалении из избранного' });
  }
});

// Найти и удалить из избранного по userId и patternId
app.delete('/api/favorites', authenticateJWT, async (req, res) => {
  try {
    const { userId, patternId } = req.query;
    
    if (!userId || !patternId) {
      return res.status(400).json({ message: 'Требуются userId и patternId' });
    }
    
    const deletedFavorite = await Favorite.findOneAndDelete({ userId, patternId });
    
    if (!deletedFavorite) {
      return res.status(404).json({ message: 'Запись не найдена' });
    }
    
    res.json({ message: 'Запись успешно удалена из избранного' });
  } catch (error) {
    console.error('Ошибка при удалении из избранного:', error);
    res.status(500).json({ message: 'Ошибка при удалении из избранного' });
  }
});

// Маршрут для загрузки файлов
app.post('/api/upload', upload.single('chart'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Не удалось загрузить файл' });
    }
    
    // Создаем запись о загруженном файле в базе данных
    const newUpload = new Upload({
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      type: req.file.mimetype,
      size: req.file.size,
      createdAt: new Date()
    });
    
    const savedUpload = await newUpload.save();
    
    // Возвращаем URL загруженного файла
    res.json({
      success: true,
      imageUrl: `/uploads/${req.file.filename}`,
      file: {
        ...req.file,
        id: savedUpload._id
      }
    });
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    res.status(500).json({ error: 'Не удалось сохранить файл', message: error.message });
  }
});

// Перенаправление всех остальных запросов на React приложение в продакшн режиме
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`MongoDB URI: ${MONGODB_URI}`);
  console.log(`Загруженные изображения доступны по пути: http://localhost:${PORT}/uploads/`);
});