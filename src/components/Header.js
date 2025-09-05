import React from 'react';
import { Home, Package, Users, Settings, Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const Header = ({ onLogoClick, activeTab, onTabChange, lowStockCount = 0, currentMonth, currentYear, onMonthChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Početna', icon: <Home size={18} /> },
    { id: 'inventory', label: 'Magacin', icon: <Package size={18} /> },
    { id: 'assignments', label: 'Zaduženja', icon: <Users size={18} /> },
    { id: 'calendar', label: 'Kalendar', icon: <Calendar size={18} /> },
    { id: 'export', label: 'Izvoz', icon: <Download size={18} /> },
    { id: 'admin', label: 'Admin', icon: <Settings size={18} /> }
  ];

  // Mesec nazivi na srpskom
  const monthNames = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];



  return (
    <header className="header">
      {/* Logo na sredini iznad */}
      <div className="header-top">
        <div className="logo-center" onClick={onLogoClick}>
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
      </div>

      {/* Navigacija celom dužinom */}
      <div className="header-bottom">
        <div className="header-center-content">
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
          </nav>

          {/* Navigacija kroz mesece */}
          <div className="month-navigation">
            <button
              onClick={() => onMonthChange && onMonthChange('previous')}
              className="month-nav-btn"
              title="Prethodni mesec"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="current-month-display">
              <div className="current-month">
                {monthNames[currentMonth]}
              </div>
              <div className="current-year">
                {currentYear}
              </div>
            </div>

            <button
              onClick={() => onMonthChange && onMonthChange('next')}
              className="month-nav-btn"
              title="Sledeći mesec"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Indikator za nisko stanje */}
          {lowStockCount > 0 && (
            <div className="low-stock-indicator" title={`${lowStockCount} materijala ima nisko stanje`}>
              <Package size={16} />
              <span className="low-stock-count">{lowStockCount}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
