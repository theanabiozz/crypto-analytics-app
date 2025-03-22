import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
// Заменяем импорт на databaseService вместо api.service и localStorageService
import { patternsService } from '../../services/databaseService';

// Компонент панели с вкладками для разных типов контента
const ContentTabs = ({ value, onChange }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs
        value={value}
        onChange={onChange}
        aria-label="Типы контента"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Паттерны" value="patterns" />
        <Tab label="Статьи" value="articles" />
        <Tab label="Образовательные материалы" value="educational" />
      </Tabs>
    </Box>
  );
};

const ContentManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Состояния для компонента
  const [contentType, setContentType] = useState(searchParams.get('type') || 'patterns');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Эффект загрузки данных при изменении типа контента
  useEffect(() => {
    fetchContent();
    // Обновляем URL при смене вкладки
    setSearchParams({ type: contentType });
  }, [contentType]);

  // Функция для загрузки контента выбранного типа
  const fetchContent = async () => {
    setLoading(true);
    try {
      if (contentType === 'patterns') {
        // Загрузка паттернов из API
        console.log('Загрузка паттернов из API');
        const response = await patternsService.getAll();
        console.log('Полученные паттерны:', response.data);
        setItems(response.data || []);
      } else {
        // Для других типов контента временно используем демо-данные
        console.log('Загрузка демо-данных для', contentType);
        setTimeout(() => {
          if (contentType === 'articles') {
            setItems(demoArticles);
          } else {
            setItems(demoEducational);
          }
          setLoading(false);
        }, 500);
      }
    } catch (error) {
      console.error(`Ошибка загрузки ${contentType}:`, error);
      setSnackbar({
        open: true,
        message: `Не удалось загрузить данные. ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Обработчик смены вкладки
  const handleTabChange = (event, newValue) => {
    setContentType(newValue);
  };

  // Обработчик поиска
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Фильтрация элементов по поисковому запросу
  const filteredItems = items.filter(item => 
    (item.title || item.patternName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.ticker || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Обработчики удаления элемента
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      if (contentType === 'patterns') {
        await patternsService.delete(itemToDelete.id);
        console.log('Паттерн удален:', itemToDelete.id);
      } 
      // В будущем здесь можно добавить обработку других типов контента
      
      setSnackbar({
        open: true,
        message: 'Элемент успешно удален',
        severity: 'success'
      });
      
      // Обновляем список после удаления
      fetchContent();
    } catch (error) {
      console.error(`Ошибка удаления ${contentType}:`, error);
      setSnackbar({
        open: true,
        message: 'Ошибка при удалении элемента',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Нет данных';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Демо данные для разработки
  const demoArticles = [
    {
      id: 1,
      title: 'Как распознать разворотные паттерны',
      description: 'Подробное руководство по определению ключевых сигналов разворота тренда.',
      status: 'published',
      createdAt: '2023-03-16T11:20:00Z',
      updatedAt: '2023-03-17T09:10:00Z'
    },
    {
      id: 2,
      title: 'Топ-5 паттернов для начинающих трейдеров',
      description: 'Обзор наиболее надежных и простых для идентификации паттернов.',
      status: 'published',
      createdAt: '2023-03-15T16:40:00Z',
      updatedAt: '2023-03-15T18:25:00Z'
    }
  ];

  const demoEducational = [
    {
      id: 1,
      title: 'Основы технического анализа',
      description: 'Введение в базовые принципы технического анализа криптовалютных графиков.',
      status: 'published',
      createdAt: '2023-03-18T08:30:00Z',
      updatedAt: '2023-03-19T10:15:00Z'
    }
  ];

  // Определение заголовка страницы в зависимости от типа контента
  const getPageTitle = () => {
    switch (contentType) {
      case 'patterns':
        return 'Управление паттернами';
      case 'articles':
        return 'Управление статьями';
      case 'educational':
        return 'Управление образовательными материалами';
      default:
        return 'Управление контентом';
    }
  };

  // Определение URL для создания нового элемента
  const getCreateUrl = () => {
    switch (contentType) {
      case 'patterns':
        return '/admin/patterns/new';
      default:
        return `/admin/content/new?type=${contentType}`;
    }
  };

  // Определение URL для редактирования элемента
  const getEditUrl = (item) => {
    switch (contentType) {
      case 'patterns':
        return `/admin/patterns/${item.id}`;
      default:
        return `/admin/content/${item.id}?type=${contentType}`;
    }
  };

  // Получение названия элемента
  const getItemTitle = (item) => {
    if (contentType === 'patterns') {
      if (item.name && item.ticker) {
        return `${item.name} (${item.ticker})`;
      } else if (item.patternName) {
        return item.patternName;
      }
    }
    return item.title || 'Без названия';
  };

  // Получение описания элемента
  const getItemDescription = (item) => {
    const description = item.description || '';
    return description.length > 100 ? `${description.substring(0, 100)}...` : description;
  };

  // Визуальное отображение статуса
  const renderStatus = (status) => {
    if (status === 'published') {
      return <Chip label="Опубликован" color="success" size="small" />;
    } else {
      return <Chip label="Черновик" color="default" size="small" />;
    }
  };

  return (
    <AdminLayout title={getPageTitle()}>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            {getPageTitle()}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate(getCreateUrl())}
          >
            Добавить
          </Button>
        </Box>

        <ContentTabs value={contentType} onChange={handleTabChange} />

        <Box mb={3}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : filteredItems.length === 0 ? (
          <Box textAlign="center" my={4}>
            <Typography variant="h6" color="textSecondary">
              {searchQuery ? 'Ничего не найдено' : 'Нет доступного контента'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate(getCreateUrl())}
              sx={{ mt: 2 }}
            >
              Добавить
            </Button>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Создан</TableCell>
                  <TableCell>Обновлен</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.map(item => (
                  <TableRow 
                    key={item.id} 
                    hover
                    sx={{
                      backgroundColor: item.status === 'draft' ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                    }}
                  >
                    <TableCell>{getItemTitle(item)}</TableCell>
                    <TableCell>{getItemDescription(item)}</TableCell>
                    <TableCell>{renderStatus(item.status)}</TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>{formatDate(item.updatedAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(getEditUrl(item))}
                        size="small"
                        title="Редактировать"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(item)}
                        size="small"
                        title="Удалить"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Вы уверены, что хотите удалить "{getItemTitle(itemToDelete || {})}"? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Отмена
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомление */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default ContentManager;