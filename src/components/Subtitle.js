import React from 'react';

const Subtitle = ({ lastUpdate }) => {
  return (
    <div className="app-subtitle">
      <h2>Свежая аналитика</h2>
      <p>Последнее обновление: {lastUpdate || 'Сегодня'}</p>
    </div>
  );
};

export default Subtitle;