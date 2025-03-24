// models/Pattern.js - Модель для криптовалютных паттернов
const mongoose = require('mongoose');

const patternSchema = new mongoose.Schema({
  // Идентификатор паттерна (для URL)
  id: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  // Название паттерна
  title: {
    type: String,
    required: true
  },
  // Название криптовалюты
  name: {
    type: String,
    required: true
  },
  // Тикер криптовалюты
  ticker: {
    type: String,
    required: true
  },
  // Текущая цена
  price: {
    type: Number,
    required: true
  },
  // Изменение цены в процентах
  priceChange: {
    type: Number,
    required: true
  },
  // Тип паттерна (бычий, медвежий, нейтральный)
  patternType: {
    type: String,
    enum: ['bullish', 'bearish', 'neutral'],
    default: 'bullish'
  },
  // Название паттерна для отображения
  patternName: {
    type: String,
    required: false
  },
  // Метка паттерна
  patternLabel: {
    type: String,
    required: false
  },
  // Описание паттерна
  description: {
    type: String,
    required: false
  },
  // Статус публикации
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  // Уровни и значения
  levels: {
    resistance: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    },
    support: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    },
    potential: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    },
    timeframe: {
      type: String,
      required: false
    }
  },
  // URL изображения графика
  chartImageUrl: {
    type: String,
    required: false
  },
  // Даты создания и обновления
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Обновление даты при изменении документа
patternSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Метод для перевода MongoDB _id в id при сериализации JSON
patternSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    if (!ret.id && ret._id) {
      ret.id = ret._id.toString();
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Экспортируем модель
module.exports = mongoose.model('Pattern', patternSchema);