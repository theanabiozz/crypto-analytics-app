import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/api.service';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Для демонстрации и разработки, используем заглушку
      // В реальном приложении раскомментируйте и используйте authService.login
      
      // Имитируем успешный вход для разработки
      setTimeout(() => {
        // Тестовые данные для разработки
        const fakeResponse = {
          data: {
            token: 'fake-jwt-token',
            user: { id: 1, username: username, role: 'admin' }
          }
        };
        
        login(fakeResponse.data.token, fakeResponse.data.user);
        navigate('/admin');
      }, 1000);
      
      // Раскомментируйте для реального API
      /*
      const response = await authService.login({ username, password });
      login(response.data.token, response.data.user);
      navigate('/admin');
      */
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Ошибка входа');
    } finally {
      // setLoading(false); // Для реального API
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            borderRadius: 2
          }}
        >
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Вход в админ-панель
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
            CryptoPatterns Admin
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Имя пользователя"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Войти'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;