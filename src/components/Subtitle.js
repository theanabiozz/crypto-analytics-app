import React from 'react';
import { Box, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const Subtitle = ({ lastUpdate, onRefresh, isLoading }) => {
  return (
    <div className="app-subtitle">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h2>Свежая аналитика</h2>
        <Tooltip title="Обновить данные">
          <IconButton 
            onClick={onRefresh} 
            disabled={isLoading}
            size="small"
            sx={{ color: 'var(--tg-theme-button-color)' }}
          >
            {isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <p>Последнее обновление: {lastUpdate || 'Сегодня'}</p>
    </div>
  );
};

export default Subtitle;