import React from 'react';
import { Home, Package, Users, BarChart3, FileSpreadsheet } from 'lucide-react';

const Tabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Početna', icon: Home },
    { id: 'inventory', label: 'Magacin', icon: Package },
    { id: 'assignments', label: 'Zaduženja', icon: Users },
    { id: 'reports', label: 'Izveštaji', icon: BarChart3 },
    { id: 'excel', label: 'Excel', icon: FileSpreadsheet }
  ];

  return (
    <div className="tabs-container">
      <div className="tabs">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <IconComponent size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
