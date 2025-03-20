import React, { useState, useEffect } from 'react';
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
  CardContent
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import localStorageService from '../../services/localStorageService';

const PatternEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewPattern = !id || id === 'new';
  
  const [loading, setLoading] = useState(!isNewPattern);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  // Состояние формы
  const [pattern, setPattern] = useState({
    title: '',
    description: '',
    patternType: 'bullish', // bullish, bearish, neutral
    patternLabel: '',
    status: 'draft', // draft, published
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
          // Загружаем паттерны из localStorage
          const patterns = localStorageService.getPatterns();
          // Ищем нужный паттерн по id
          const foundPattern = patterns.find(p => p.id === id);
          
          if (foundPattern) {
            setPattern(foundPattern);
          } else {
            // Если паттерн не найден, показываем ошибку
            alert('Паттерн не найден');
            navigate('/admin/content?type=patterns');
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Error loading pattern:', error);
          setLoading(false);
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

  // Обработчик сохранения формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    
    try {
      // Загружаем текущие паттерны
      const patterns = localStorageService.getPatterns();
      
      if (isNewPattern) {
        // Создаем новый паттерн
        const newPattern = {
          ...pattern,
          id: pattern.title.toLowerCase().replace(/\s+/g, '-'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Добавляем новый паттерн в список и сохраняем
        localStorageService.savePatterns([...patterns, newPattern]);
        
        // Показываем сообщение об успехе
        setSaveSuccess(true);
        setSaving(false);
        
        // Немного задержки перед перенаправлением
        setTimeout(() => {
          // Перейдем на главную страницу после добавления паттерна
          window.location.href = '/';
        }, 1500);
      } else {
        // Обновляем существующий паттерн
        const updatedPatterns = patterns.map(p => 
          p.id === id ? { 
            ...pattern, 
            updatedAt: new Date().toISOString()
          } : p
        );
        
        // Сохраняем обновленный список
        localStorageService.savePatterns(updatedPatterns);
        
        setSaveSuccess(true);
        setSaving(false);
        
        // Немного задержки перед перенаправлением
        setTimeout(() => {
          // Перейдем на главную страницу после обновления паттерна
          window.location.href = '/';
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving pattern:', error);
      setSaveError('Произошла ошибка при сохранении. Пожалуйста, попробуйте еще раз.');
      setSaving(false);
    }
  };

  // Обработчик удаления паттерна
  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот паттерн?')) {
      return;
    }
    
    try {
      // Загружаем текущие паттерны
      const patterns = localStorageService.getPatterns();
      
      // Удаляем паттерн из списка
      const updatedPatterns = patterns.filter(p => p.id !== id);
      
      // Сохраняем обновленный список
      localStorageService.savePatterns(updatedPatterns);
      
      // Перенаправляем на главную страницу после удаления
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting pattern:', error);
      alert('Произошла ошибка при удалении паттерна');
    }
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
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Основная информация
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <TextField
                  label="Название паттерна"
                  name="title"
                  value={pattern.title}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={{ mb: 3 }}
                />
                
                <TextField
                  label="Описание"
                  name="description"
                  value={pattern.description}
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
                        value={pattern.patternType}
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
                      value={pattern.patternLabel}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 3 }}
                      placeholder="Например: Разворот тренда"
                    />
                  </Grid>
                </Grid>
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
                      value={pattern.levels.resistance}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Уровень поддержки"
                      name="levels.support"
                      value={pattern.levels.support}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Потенциал (в %)"
                      name="levels.potential"
                      value={pattern.levels.potential}
                      onChange={handleChange}
                      fullWidth
                      sx={{ mb: 3 }}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Временной интервал"
                      name="levels.timeframe"
                      value={pattern.levels.timeframe}
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
                    value={pattern.status}
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
                      {pattern.title || 'Название паттерна'}
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
                    
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      {pattern.description || 'Описание паттерна будет отображаться здесь'}
                    </Typography>
                    
                    {(pattern.levels.resistance || pattern.levels.support || 
                      pattern.levels.potential || pattern.levels.timeframe) && (
                      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {pattern.levels.resistance && (
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
                        
                        {pattern.levels.support && (
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
                        
                        {pattern.levels.potential && (
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
                        
                        {pattern.levels.timeframe && (
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