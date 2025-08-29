import React from 'react';
import { Home, Package, Users, BarChart3, FileSpreadsheet } from 'lucide-react';

const Header = ({ onLogoClick, activeTab, onTabChange, lowStockCount = 0 }) => {
  const tabs = [
    { id: 'dashboard', label: 'Početna', icon: <Home size={18} /> },
    { id: 'inventory', label: 'Magacin', icon: <Package size={18} /> },
    { id: 'assignments', label: 'Zaduženja', icon: <Users size={18} /> },
    { id: 'reports', label: 'Izveštaji', icon: <BarChart3 size={18} /> },
    { id: 'export', label: 'Izvoz', icon: <FileSpreadsheet size={18} /> }
  ];

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo-container" onClick={onLogoClick}>
            <img 
              src="/logo.png" 
              alt="Logo firme" 
              className="company-logo"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
              }}
            />
            <span className="logo-fallback">LOGO</span>
          </div>
          
          <nav className="header-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`header-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            
            {/* Indikator za nisko stanje */}
            {lowStockCount > 0 && (
              <div className="low-stock-indicator" title={`${lowStockCount} materijala ima nisko stanje`}>
                <Package size={16} />
                <span className="low-stock-count">{lowStockCount}</span>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
