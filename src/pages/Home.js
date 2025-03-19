import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper, Grid } from '@mui/material';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            borderRadius: 2,
            background: 'linear-gradient(120deg, #2E3192 0%, #1BFFFF 100%)',
            color: 'white',
            textAlign: 'center',
            mb: 4
          }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            CryptoPatterns
          </Typography>
          <Typography 
            variant="h5" 
            component="div" 
            gutterBottom
            sx={{ 
              maxWidth: 600,
              mx: 'auto',
              mb: 3,
              opacity: 0.9
            }}
          >
            Ваш путеводитель в мире технического анализа криптовалют
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            component={Link}
            to="/admin"
            startIcon={<AdminIcon />}
            sx={{ 
              px: 4,
              py: 1.5,
              borderRadius: 8,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              color: '#2E3192',
              '&:hover': {
                bgcolor: 'white',
              }
            }}
          >
            Перейти в админ-панель
          </Button>
        </Paper>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h5" component="h2" gutterBottom color="primary">
                Паттерны
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                Изучите основные паттерны технического анализа, которые помогут вам принимать более обоснованные торговые решения.
              </Typography>
              <Button variant="outlined" color="primary">
                Смотреть паттерны
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h5" component="h2" gutterBottom color="primary">
                Статьи
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                Читайте экспертные статьи о техническом анализе, трендах и стратегиях торговли криптовалютами.
              </Typography>
              <Button variant="outlined" color="primary">
                Читать статьи
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h5" component="h2" gutterBottom color="primary">
                Обучение
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                Пройдите наши образовательные курсы, чтобы освоить искусство технического анализа криптовалютных рынков.
              </Typography>
              <Button variant="outlined" color="primary">
                Начать обучение
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;