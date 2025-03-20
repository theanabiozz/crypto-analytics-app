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
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { contentService, patternsService } from '../../services/api.service';
import localStorageService from '../../services/localStorageService';

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
      // Загрузка данных из localStorage в зависимости от типа контента
      let data = [];
      
      if (contentType === 'patterns') {
        data = localStorageService.getPatterns();
      } else if (contentType === 'articles') {
        data = localStorageService.getArticles();
      } else {
        data = localStorageService.getEducational();
      }
      
      setItems(data);
      setLoading(false);
      
      // Оставляем код для заглушки, если localStorageService недоступен или пуст
      if (data.length === 0) {
        setTimeout(() => {
          if (contentType === 'patterns') {
            setItems(demoPatterns);
          } else if (contentType === 'articles') {
            setItems(demoArticles);
          } else {
            setItems(demoEducational);
          }
          setLoading(false);
        }, 1000);
      }
      
      // Для реального API раскомментируйте код ниже
      /*
      let response;
      
      if (contentType === 'patterns') {
        response = await patternsService.getAll();
      } else {
        response = await contentService.getAll(contentType);
      }
      
      setItems(response.data || []);
      */
    } catch (error) {
      console.error(`Error fetching ${contentType}:`, error);
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
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Обработчики удаления элемента
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      // Удаляем элемент из списка
      const updatedItems = items.filter(item => item.id !== itemToDelete.id);
      setItems(updatedItems);
      
      // Сохраняем обновленный список в localStorage
      if (contentType === 'patterns') {
        localStorageService.savePatterns(updatedItems);
      } else if (contentType === 'articles') {
        localStorageService.saveArticles(updatedItems);
      } else {
        localStorageService.saveEducational(updatedItems);
      }
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      
      // Для реального API
      /*
      if (contentType === 'patterns') {
        await patternsService.delete(itemToDelete.id);
      } else {
        await contentService.delete(itemToDelete.id);
      }
      fetchContent();
      */
    } catch (error) {
      console.error(`Error deleting ${contentType} item:`, error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Демо данные для разработки
  const demoPatterns = [
    {
      id: 1,
      title: 'Double Top',
      description: 'Разворотный паттерн, указывающий на потенциальную смену тренда с восходящего на нисходящий.',
      status: 'published',
      createdAt: '2023-03-15T10:30:00Z',
      updatedAt: '2023-03-16T14:20:00Z'
    },
    {
      id: 2,
      title: 'Head and Shoulders',
      description: 'Классический разворотный паттерн, сигнализирующий о смене тренда.',
      status: 'published',
      createdAt: '2023-03-14T09:15:00Z',
      updatedAt: '2023-03-14T11:45:00Z'
    },
    {
      id: 3,
      title: 'Bull Flag',
      description: 'Продолжение тренда, указывающее на продолжение бычьего движения после консолидации.',
      status: 'draft',
      createdAt: '2023-03-13T14:45:00Z',
      updatedAt: '2023-03-13T16:30:00Z'
    }
  ];

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
                  <TableRow key={item.id} hover>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>
                      {item.description && item.description.length > 100
                        ? `${item.description.substring(0, 100)}...`
                        : item.description}
                    </TableCell>
                    <TableCell>
                      {item.status === 'published' ? 'Опубликован' : 'Черновик'}
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>{formatDate(item.updatedAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(getEditUrl(item))}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(item)}
                        size="small"
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
            Вы уверены, что хотите удалить "{itemToDelete?.title}"? Это действие нельзя отменить.
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
    </AdminLayout>
  );
};

export default ContentManager;