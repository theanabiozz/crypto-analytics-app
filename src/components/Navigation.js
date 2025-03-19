import React from 'react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'analytics', icon: '📊', label: 'Аналитика' },
    { id: 'favorites', icon: '⭐', label: 'Избранное' },
    { id: 'notifications', icon: '🔔', label: 'Уведомления' },
    { id: 'settings', icon: '⚙️', label: 'Настройки' }
  ];

  return (
    <div className="nav-tabs">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          {tab.label}
        </div>
      ))}
    </div>
  );
};

export default Navigation;