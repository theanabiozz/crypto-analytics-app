// models/Favorite.js - Модель для избранных паттернов
const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: String, // Изменили с mongoose.Schema.Types.ObjectId на String
    required: true
  },
  patternId: {
    type: String, // Используем String, так как patternId может быть строкой ID или MongoDB ObjectId
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Составной индекс для предотвращения дубликатов
favoriteSchema.index({ userId: 1, patternId: 1 }, { unique: true });

// Метод для перевода MongoDB _id в id при сериализации JSON
favoriteSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Экспортируем модель
module.exports = mongoose.model('Favorite', favoriteSchema);