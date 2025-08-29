import React from 'react';
import { Package, FolderOpen, BarChart3, Calendar } from 'lucide-react';

const StatsOverview = ({ totalMaterials, totalCategories, overallTotal, selectedMonth, selectedYear }) => {
  const getMonthName = (month) => {
    const months = {
      '01': 'Januar', '02': 'Februar', '03': 'Mart', '04': 'April',
      '05': 'Maj', '06': 'Jun', '07': 'Jul', '08': 'Avgust',
      '09': 'Septembar', '10': 'Oktobar', '11': 'Novembar', '12': 'Decembar'
    };
    return months[month] || month;
  };

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">
          <Package size={32} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{totalMaterials}</div>
          <div className="stat-label">Ukupno Materijala</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <FolderOpen size={32} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{totalCategories}</div>
          <div className="stat-label">Kategorija</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <BarChart3 size={32} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{overallTotal}</div>
          <div className="stat-label">Ukupna Količina</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <Calendar size={32} />
        </div>
        <div className="stat-content">
          <div className="stat-number">{getMonthName(selectedMonth)}</div>
          <div className="stat-label">{selectedYear}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
