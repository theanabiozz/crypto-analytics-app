import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Article as ArticleIcon,
  Add as AddIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { patternsService, contentService } from '../../services/api.service';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    patternsCount: 0,
    articlesCount: 0,
    recentPatterns: [],
    recentArticles: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // В реальном приложении вы бы сделали API-запрос для статистики
        // Здесь мы просто имитируем загрузку
        
        setTimeout(() => {
          // Демо-данные для разработки
          setStats({
            patternsCount: 12,
            articlesCount: 8,
            recentPatterns: demoData.recentPatterns,
            recentArticles: demoData.recentArticles
          });
          
          setLoading(false);
        }, 1000);
        
        // Для реального API раскомментируйте код ниже
        /*
        const [patternsResponse, articlesResponse] = await Promise.all([
          patternsService.getAll(),
          contentService.getAll('article')
        ]);
        
        const patterns = patternsResponse.data || [];
        const articles = articlesResponse.data || [];
        
        setStats({
          patternsCount: patterns.length,
          articlesCount: articles.length,
          recentPatterns: patterns.slice(0, 5),
          recentArticles: articles.slice(0, 5)
        });
        
        setLoading(false);
        */
      } catch (error) {
        console.error('Error fetching dashboard data', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  // Функция для форматирования даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Заглушки для демо-данных
  const demoData = {
    recentPatterns: [
      { id: 1, title: 'Паттерн Double Top', createdAt: '2023-03-15T10:30:00Z' },
      { id: 2, title: 'Паттерн Head and Shoulders', createdAt: '2023-03-14T09:15:00Z' },
      { id: 3, title: 'Паттерн Bull Flag', createdAt: '2023-03-13T14:45:00Z' }
    ],
    recentArticles: [
      { id: 1, title: 'Как распознать разворотные паттерны', createdAt: '2023-03-16T11:20:00Z' },
      { id: 2, title: 'Топ-5 паттернов для начинающих трейдеров', createdAt: '2023-03-15T16:40:00Z' }
    ]
  };

  return (
    <AdminLayout title="Дашборд">
      {loading ? (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '70vh' 
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Обзор
          </Typography>
          
          {/* Статистика */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  borderRadius: 2
                }}
              >
                <Avatar sx={{ bgcolor: 'primary.main', mb: 2, width: 56, height: 56 }}>
                  <TrendingUpIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" component="div">
                  {stats.patternsCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего паттернов
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  borderRadius: 2
                }}
              >
                <Avatar sx={{ bgcolor: 'secondary.main', mb: 2, width: 56, height: 56 }}>
                  <ArticleIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" component="div">
                  {stats.articlesCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего статей
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Недавние паттерны и статьи */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      Недавние паттерны
                    </Typography>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <TrendingUpIcon />
                    </Avatar>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <List sx={{ mb: 0 }}>
                    {stats.recentPatterns.map((pattern) => (
                      <ListItem key={pattern.id} 
                        sx={{ 
                          px: 1, 
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'action.hover' },
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/admin/patterns/${pattern.id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar variant="rounded" sx={{ bgcolor: 'primary.light' }}>
                            <TrendingUpIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={pattern.title}
                          secondary={`Создан: ${formatDate(pattern.createdAt)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions>
                  <Button 
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/patterns/new')}
                  >
                    Добавить паттерн
                  </Button>
                  <Button 
                    onClick={() => navigate('/admin/content?type=pattern')}
                    sx={{ ml: 'auto' }}
                  >
                    Все паттерны
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      Недавние статьи
                    </Typography>
                    <Avatar sx={{ bgcolor: 'secondary.light' }}>
                      <ArticleIcon />
                    </Avatar>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <List sx={{ mb: 0 }}>
                    {stats.recentArticles.map((article) => (
                      <ListItem key={article.id} 
                        sx={{ 
                          px: 1, 
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'action.hover' },
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/admin/content/${article.id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar variant="rounded" sx={{ bgcolor: 'secondary.light' }}>
                            <ArticleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={article.title}
                          secondary={`Создан: ${formatDate(article.createdAt)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions>
                  <Button 
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/content/new?type=article')}
                  >
                    Добавить статью
                  </Button>
                  <Button 
                    onClick={() => navigate('/admin/content?type=article')}
                    sx={{ ml: 'auto' }}
                  >
                    Все статьи
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </AdminLayout>
  );
};

export default Dashboard;