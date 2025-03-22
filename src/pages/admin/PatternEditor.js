// Обновленная версия src/pages/admin/PatternEditor.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  Divider,
  Alert,
  Card,
  CardContent,
  Snackbar,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { patternsService } from '../../services/databaseService';

const PatternEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewPattern = !id || id === 'new';
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(!isNewPattern);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [chartImage, setChartImage] = useState(null);
  const [chartImagePreview, setChartImagePreview] = useState('');
  
  // Состояние формы
  const [pattern, setPattern] = useState({
    title: '',
    name: '', // Название криптовалюты
    ticker: '', // Тикер криптовалюты
    price: '', // Цена
    priceChange: '', // Изменение цены в процентах
    description: '',
    patternType: 'bullish', // bullish, bearish, neutral
    patternName: '', // Название паттерна
    patternLabel: '',
    status: 'draft', // draft, published
    chartImageUrl: '', // URL скриншота графика
    levels: {
      resistance: '',
      support: '',
      potential: '',
      timeframe: ''
    }
  });

  // Загрузка данных паттерна, если это режим редактирования
  useEffect(() => {
    if (!isNewPattern) {
      const loadPattern = async () => {
        try {
          // Загружаем паттерн из API вместо localStorage
          const response = await patternsService.getById(id);
          
          if (response && response.data) {
            console.log('Загружен паттерн из API:', response.data);
            setPattern(response.data);
            
            // Если есть изображение, устанавливаем предпросмотр
            if (response.data.chartImageUrl) {
              setChartImagePreview(response.data.chartImageUrl);
            }
          } else {
            // Если паттерн не найден, показываем ошибку
            console.error('Паттерн не найден в API');
            alert('Паттерн не найден');
            navigate('/admin/content?type=patterns');
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Ошибка при загрузке паттерна:', error);
          setLoading(false);
          setSaveError('Ошибка при загрузке паттерна. Пожалуйста, попробуйте еще раз.');
        }
      };
      
      loadPattern();
    }
  }, [id, isNewPattern, navigate]);

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Обработка вложенных полей (например, levels.resistance)
      const [parent, child] = name.split('.');
      setPattern({
        ...pattern,
        [parent]: {
          ...pattern[parent],
          [child]: value
        }
      });
    } else {
      setPattern({
        ...pattern,
        [name]: value
      });
    }
  };

  // Обработчик загрузки файла
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.match('image.*')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }

      // Устанавливаем файл для последующей загрузки
      setChartImage(file);

      // Создаем URL для предпросмотра
      const reader = new FileReader();
      reader.onload = (e) => {
        setChartImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработчик клика по кнопке загрузки
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Обработчик сохранения формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    
    try {
      let chartImageUrl = pattern.chartImageUrl || '';

      // Если выбран новый файл, сначала загружаем его
      if (chartImage) {
        const formData = new FormData();
        formData.append('chart', chartImage);
        
        try {
          const uploadResponse = await patternsService.uploadChartImage(formData);
          
          if (uploadResponse && uploadResponse.data && uploadResponse.data.imageUrl) {
            chartImageUrl = uploadResponse.data.imageUrl;
          } else {
            throw new Error('Не удалось получить URL загруженного изображения');
          }
        } catch (uploadError) {
          console.error('Ошибка при загрузке изображения:', uploadError);
          setSaveError('Ошибка при загрузке изображения. Пожалуйста, попробуйте еще раз.');
          setSaving(false);
          return;
        }
      }
      
      // Подготавливаем данные паттерна для сохранения
      const patternData = {
        ...pattern,
        chartImageUrl,
        updatedAt: new Date().toISOString()
      };
      
      // Убедимся что title содержит название паттерна
      if (!patternData.patternName) {
        patternData.patternName = patternData.title;
      }
      
      console.log('Данные для сохранения:', patternData);
      
      if (isNewPattern) {
        // Создаем новый паттерн
        // Генерируем ID из названия (slug)
        const patternId = pattern.title
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-');
        
        const newPatternData = {
          ...patternData,
          id: patternId,
          createdAt: new Date().toISOString()
        };
        
        console.log('Создание нового паттерна:', newPatternData);
        await patternsService.create(newPatternData);
        
        setSaveSuccess(true);
        
        // Перенаправляем на страницу со списком паттернов
        setTimeout(() => {
          navigate('/admin/content?type=patterns');
        }, 1500);
      } else {
        // Обновляем существующий паттерн
        console.log('Обновление существующего паттерна:', id, patternData);
        await patternsService.update(id, patternData);
        
        setSaveSuccess(true);
      }
    } catch (error) {
      console.error('Ошибка при сохранении паттерна:', error);
      setSaveError('Произошла ошибка при сохранении. Пожалуйста, попробуйте еще раз.');
    } finally {
      setSaving(false);
    }
  };

  // Обработчик удаления паттерна
  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот паттерн?')) {
      return;
    }
    
    try {
      // Удаляем паттерн через API
      console.log('Удаление паттерна:', id);
      await patternsService.delete(id);
      
      // Перенаправляем на страницу со списком паттернов
      navigate('/admin/content?type=patterns');
    } catch (error) {
      console.error('Ошибка при удалении паттерна:', error);
      alert('Произошла ошибка при удалении паттерна');
    }
  };

  // Обработчик удаления изображения
  const handleRemoveImage = () => {
    setChartImage(null);
    setChartImagePreview('');
    setPattern({
      ...pattern,
      chartImageUrl: ''
    });
  };

  return (
    <AdminLayout title={isNewPattern ? 'Создание паттерна' : 'Редактирование паттерна'}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          {/* Верхняя панель с кнопками */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3 
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/admin/content?type=patterns')}
            >
              Назад к списку
            </Button>
            <Box>
              {!isNewPattern && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  sx={{ mr: 2 }}
                >
                  Удалить
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={<SaveIcon />}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Сохранение...
                  </>
                ) : (
                  'Сохранить'
                )}
              </Button>
            </Box>
          </Box>

          {/* Сообщения об успехе или ошибке */}
          {saveSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Паттерн успешно сохранен
            </Alert>
          )}
          
          {saveError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {saveError}
            </Alert>
          )}

          {/* Основная форма */}
          <Grid container spacing={3}>
            {/* Левая колонка - основная информация */}
            <Grid item xs={12} md={8}>
              {/* Информация о криптовалюте */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Информация о криптовалюте
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Название криптовалюты"
                      name="name"
                      value={pattern.name || ''}
                      onChange={handleChange}
                      fullWidth
                      required
                      sx={{ mb: 3 }}
                      placeholder="Например: Bitcoin"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Тикер"
                      name="ticker"
                      value={pattern.ticker || ''}
                      onChange={handleChange}
                      fullWidth
                      required
                      sx={{ mb: 3 }}
                      placeholder="Например: BTC"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Цена ($)"
                      name="price"
                      type="number"
                      inputProps={{ step: "0.00000001" }}
                      value={pattern.price || ''}
                      onChange={handleChange}
                      fullWidth
                      required
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Изменение цены (%)"
                      name="priceChange"
                      type="number"
                      inputProps={{ step: "0.01" }}
                      value={pattern.priceChange || ''}
                      onChange={handleChange}
                      fullWidth
                      required
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Информация о паттерне */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Информация о паттерне
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <TextField
                  label="Название паттерна"
                  name="title"
                  value={pattern.title || ''}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mb: 3 }}
                />

                <TextField
                  label="Отображаемое название паттерна"
                  name="patternName"
                  value={pattern.patternName || pattern.title || ''}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mb: 3 }}
                  placeholder="Оставьте пустым, чтобы использовать основное название"
                />
                
                <TextField
                  label="Описание"
                  name="description"
                  value={pattern.description || ''}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={4}
                  sx={{ mb: 3 }}
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Тип паттерна</InputLabel>
                      <Select
                        name="patternType"
                        value={pattern.patternType || 'bullish'}
                        onChange={handleChange}
                        label="Тип паттерна"
                      >
                        <MenuItem value="bullish">Бычий (Bullish)</MenuItem>
                        <MenuItem value="bearish">Медвежий (Bearish)</MenuItem>
                        <MenuItem value="neutral">Нейтральный (Neutral)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Метка паттерна"
                      name="patternLabel"
                      value={pattern.patternLabel || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 3 }}
                      placeholder="Например: Разворот тренда"
                    />
                  </Grid>
                </Grid>

                {/* Загрузка скриншота графика */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Скриншот графика
                  </Typography>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  
                  <Box sx={{ 
                    border: '1px dashed #ccc', 
                    borderRadius: 1, 
                    p: 2, 
                    textAlign: 'center',
                    mb: 2
                  }}>
                    {chartImagePreview ? (
                      <Box sx={{ position: 'relative' }}>
                        <img 
                          src={chartImagePreview} 
                          alt="Preview" 
                          style={{ 
                            width: '100%', 
                            maxHeight: '300px', 
                            objectFit: 'contain',
                            borderRadius: 4
                          }} 
                        />
                        <IconButton
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.9)'
                            }
                          }}
                          onClick={handleRemoveImage}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box>
                        <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                          Загрузите скриншот графика
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          onClick={handleUploadClick}
                        >
                          Выбрать файл
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Paper>
              
              {/* Уровни и значения */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Ключевые уровни
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Уровень сопротивления"
                      name="levels.resistance"
                      value={pattern.levels?.resistance || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 3 }}
                      type="number"
                      inputProps={{ step: "0.0001" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Уровень поддержки"
                      name="levels.support"
                      value={pattern.levels?.support || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 3 }}
                      type="number"
                      inputProps={{ step: "0.0001" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Потенциал (в %)"
                      name="levels.potential"
                      value={pattern.levels?.potential || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 3 }}
                      type="number"
                      inputProps={{ step: "0.01" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Временной интервал"
                      name="levels.timeframe"
                      value={pattern.levels?.timeframe || ''}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 3 }}
                      placeholder="Например: 14 дней"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            {/* Правая колонка - статус и предпросмотр */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Статус публикации
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Статус</InputLabel>
                  <Select
                    name="status"
                    value={pattern.status || 'draft'}
                    onChange={handleChange}
                    label="Статус"
                  >
                    <MenuItem value="draft">Черновик</MenuItem>
                    <MenuItem value="published">Опубликован</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
              
              {/* Предпросмотр паттерна */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Предпросмотр
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box 
                    sx={{ 
                      p: 2, 
                      border: '1px dashed #ccc', 
                      borderRadius: 1,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {pattern.name || 'Название криптовалюты'} {pattern.ticker ? `${pattern.ticker}` : ''}
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        mt: 1, 
                        display: 'inline-block', 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1,
                        bgcolor: pattern.patternType === 'bullish' 
                          ? 'success.light' 
                          : pattern.patternType === 'bearish' 
                            ? 'error.light' 
                            : 'warning.light',
                        color: pattern.patternType === 'bullish' 
                          ? 'success.contrastText' 
                          : pattern.patternType === 'bearish' 
                            ? 'error.contrastText' 
                            : 'warning.contrastText',
                      }}
                    >
                      {pattern.patternLabel || 
                        (pattern.patternType === 'bullish' 
                          ? 'Бычий паттерн' 
                          : pattern.patternType === 'bearish' 
                            ? 'Медвежий паттерн' 
                            : 'Нейтральный паттерн')
                      }
                    </Box>
                    
                    {/* Предпросмотр изображения графика */}
                    {chartImagePreview && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <img 
                          src={chartImagePreview} 
                          alt="График" 
                          style={{ 
                            width: '100%', 
                            borderRadius: 4,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                          }} 
                        />
                      </Box>
                    )}
                    
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      {pattern.description || 'Описание паттерна будет отображаться здесь'}
                    </Typography>
                    
                    {(pattern.levels?.resistance || pattern.levels?.support || 
                      pattern.levels?.potential || pattern.levels?.timeframe) && (
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {pattern.levels?.resistance && (
                          <Box sx={{ 
                            p: 1, 
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            minWidth: '80px',
                            textAlign: 'center'
                          }}>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Сопротивление
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {pattern.levels.resistance}
                            </Typography>
                          </Box>
                        )}
                        
                        {pattern.levels?.support && (
                          <Box sx={{ 
                            p: 1, 
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            minWidth: '80px',
                            textAlign: 'center'
                          }}>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Поддержка
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {pattern.levels.support}
                            </Typography>
                          </Box>
                        )}
                        
                        {pattern.levels?.potential && (
                          <Box sx={{ 
                            p: 1, 
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            minWidth: '80px',
                            textAlign: 'center'
                          }}>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Потенциал
                            </Typography>
                            <Typography 
                              variant="body2" 
                              fontWeight="bold"
                              color={Number(pattern.levels.potential) >= 0 ? 'success.main' : 'error.main'}
                            >
                              {Number(pattern.levels.potential) >= 0 ? '+' : ''}{pattern.levels.potential}%
                            </Typography>
                          </Box>
                        )}
                        
                        {pattern.levels?.timeframe && (
                          <Box sx={{ 
                            p: 1, 
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            minWidth: '80px',
                            textAlign: 'center'
                          }}>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Срок
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {pattern.levels.timeframe}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </AdminLayout>
  );
};

export default PatternEditor;