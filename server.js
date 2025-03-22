const jsonServer = require('json-server');
const express = require('express'); // Убедитесь, что express установлен: npm install --save express
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({ 
  static: './public'  // Здесь указываем директорию для статических файлов
});
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // Требуется установить: npm install --save multer

// Создаем директорию для загрузок, если её нет
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

console.log('Директория для загрузок:', uploadsDir);

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    // Создаем уникальное имя файла на основе времени и оригинального имени
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

// Используем стандартные middleware
server.use(middlewares);

// Дополнительно указываем папку uploads для статических файлов
// Используем express.static для этого
server.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Роут для загрузки изображений
server.post('/upload', upload.single('chart'), (req, res) => {
  console.log('Получен запрос на загрузку файла');
  
  if (!req.file) {
    console.error('Файл не получен');
    return res.status(400).json({ error: 'Не удалось загрузить файл' });
  }
  
  console.log('Информация о загруженном файле:', req.file);
  
  // Возвращаем URL загруженного файла
  const imageUrl = `/uploads/${req.file.filename}`;
  console.log('URL загруженного файла:', imageUrl);
  
  res.json({
    success: true,
    imageUrl: imageUrl,
    file: req.file
  });
});

// Используем router json-server для API
server.use(router);

// Запускаем сервер
server.listen(3001, () => {
  console.log('JSON Server is running on port 3001');
  console.log('Статические файлы обслуживаются из:', path.join(__dirname, 'public'));
  console.log('Загруженные изображения доступны по пути: http://localhost:3001/uploads/');
});