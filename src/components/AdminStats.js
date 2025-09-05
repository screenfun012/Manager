import React, { useMemo, useState, useEffect } from 'react';
import eventBus, { EVENTS } from '../services/eventBus';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Package,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const AdminStats = ({ 
  materials = [], 
  materialsDB = [], 
  employeesDB = [], 
  assignments = [],
  currentPeriod 
}) => {
  const [localMaterialsDB, setLocalMaterialsDB] = useState(materialsDB);
  
  console.log('🚨🚨🚨 AdminStats COMPONENT RENDERED! 🚨🚨🚨');
  console.log('🔍 AdminStats: materialsDB length:', localMaterialsDB.length);
  console.log('🔍 AdminStats: assignments length:', assignments.length);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Sinhronizuj lokalni state sa prop-om
  useEffect(() => {
    console.log('🔍 AdminStats: materialsDB prop changed, updating local state');
    setLocalMaterialsDB(materialsDB);
  }, [materialsDB]);

  // Event listeners za real-time ažuriranje
  useEffect(() => {
    console.log('🔍 AdminStats: Setting up event listeners');

    const handleMaterialCreated = (data) => {
      console.log('🔍 AdminStats: Material created event received', data);
      setLocalMaterialsDB(prev => {
        const updated = [...prev, data.material];
        console.log('🔍 AdminStats: localMaterialsDB updated, new length:', updated.length);
        return updated;
      });
      setLastRefresh(new Date());
    };

    const handleMaterialUpdated = (data) => {
      console.log('🔍 AdminStats: Material updated event received', data);
      setLocalMaterialsDB(prev => {
        const updated = prev.map(m => m.id === data.material.id ? data.material : m);
        console.log('🔍 AdminStats: localMaterialsDB updated after material update');
        return updated;
      });
      setLastRefresh(new Date());
    };

    const handleMaterialDeleted = (data) => {
      console.log('🔍 AdminStats: Material deleted event received', data);
      setLocalMaterialsDB(prev => {
        const updated = prev.filter(m => m.id !== data.materialId);
        console.log('🔍 AdminStats: localMaterialsDB updated after material deletion, new length:', updated.length);
        return updated;
      });
      setLastRefresh(new Date());
    };

    // Pretplata na eventove
    const unsubscribeMaterial = eventBus.subscribe(EVENTS.MATERIAL_CREATED, handleMaterialCreated);
    const unsubscribeMaterialUpdated = eventBus.subscribe(EVENTS.MATERIAL_UPDATED, handleMaterialUpdated);
    const unsubscribeMaterialDeleted = eventBus.subscribe(EVENTS.MATERIAL_DELETED, handleMaterialDeleted);

    return () => {
      console.log('AdminStats: Cleaning up event listeners');
      unsubscribeMaterial();
      unsubscribeMaterialUpdated();
      unsubscribeMaterialDeleted();
    };
  }, []);

  // Izračunavanje statistika
  const stats = useMemo(() => {
    console.log('🔍 AdminStats: Recalculating stats with localMaterialsDB length:', localMaterialsDB.length);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Dnevne statistike - assignments
    const todayAssignments = assignments.filter(a => {
      const assignmentDate = new Date(a.created_at);
      return assignmentDate >= todayStart;
    }).length;

    const todayQuantity = assignments.filter(a => {
      const assignmentDate = new Date(a.created_at);
      return assignmentDate >= todayStart;
    }).reduce((sum, a) => sum + a.quantity, 0);

    // Dnevne statistike - novi materijali
    const todayNewMaterials = localMaterialsDB.filter(m => {
      const materialDate = new Date(m.created_at);
      return materialDate >= todayStart;
    }).length;

    console.log('🔍 AdminStats: todayNewMaterials:', todayNewMaterials);
    console.log('🔍 AdminStats: todayStart:', todayStart);
    console.log('🔍 AdminStats: localMaterialsDB with created_at:', localMaterialsDB.map(m => ({ name: m.name, created_at: m.created_at })));
    
    // Mesečne statistike - assignments
    const monthAssignments = assignments.filter(a => {
      const assignmentDate = new Date(a.created_at);
      return assignmentDate >= monthStart;
    }).length;
    
    const monthQuantity = assignments.filter(a => {
      const assignmentDate = new Date(a.created_at);
      return assignmentDate >= monthStart;
    }).reduce((sum, a) => sum + a.quantity, 0);
    
    // Mesečne statistike - novi materijali
    const monthNewMaterials = localMaterialsDB.filter(m => {
      const materialDate = new Date(m.created_at);
      return materialDate >= monthStart;
    }).length;
    
    // Prošli mesec za poređenje
    const lastMonthAssignments = assignments.filter(a => {
      const assignmentDate = new Date(a.created_at);
      return assignmentDate >= lastMonthStart && assignmentDate <= lastMonthEnd;
    }).length;
    
    const lastMonthQuantity = assignments.filter(a => {
      const assignmentDate = new Date(a.created_at);
      return assignmentDate >= lastMonthStart && assignmentDate <= lastMonthEnd;
    }).reduce((sum, a) => sum + a.quantity, 0);
    
    // Trendovi
    const assignmentTrend = lastMonthAssignments > 0 
      ? ((monthAssignments - lastMonthAssignments) / lastMonthAssignments) * 100 
      : 0;
    
    const quantityTrend = lastMonthQuantity > 0 
      ? ((monthQuantity - lastMonthQuantity) / lastMonthQuantity) * 100 
      : 0;
    
    // Kategorije statistike
    const categoryStats = materials.reduce((acc, material) => {
      if (!acc[material.category]) {
        acc[material.category] = {
          count: 0,
          quantity: 0,
          materials: []
        };
      }
      acc[material.category].count++;
      acc[material.category].quantity += material.total;
      acc[material.category].materials.push(material);
      return acc;
    }, {});
    
    // Odeljenja statistike
    const departmentStats = materials.reduce((acc, material) => {
      if (!acc[material.department]) {
        acc[material.department] = {
          count: 0,
          quantity: 0,
          materials: []
        };
      }
      acc[material.department].count++;
      acc[material.department].quantity += material.total;
      acc[material.department].materials.push(material);
      return acc;
    }, {});
    
    // Top materijali
    const topMaterials = materials
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    
    // Nisko stanje
    const lowStockMaterials = localMaterialsDB.filter(m => 
      (m?.stockQuantity || 0) <= (m?.minStock || 0)
    );
    
    return {
      daily: {
        assignments: todayAssignments,
        quantity: todayQuantity,
        newMaterials: todayNewMaterials
      },
      monthly: {
        assignments: monthAssignments,
        quantity: monthQuantity,
        newMaterials: monthNewMaterials
      },
      trends: {
        assignments: assignmentTrend,
        quantity: quantityTrend
      },
      categories: categoryStats,
      departments: departmentStats,
      topMaterials,
      lowStock: lowStockMaterials,
      totals: {
        materials: localMaterialsDB.length,
        employees: employeesDB.length,
        assignments: materials.length,
        totalQuantity: materials.reduce((sum, m) => sum + m.total, 0)
      }
    };
  }, [materials, localMaterialsDB, employeesDB, assignments, lastRefresh]);

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp size={16} className="text-green-500" />;
    if (trend < 0) return <TrendingDown size={16} className="text-red-500" />;
    return <Clock size={16} className="text-gray-500" />;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return '#10b981';
    if (trend < 0) return '#ef4444';
    return '#6b7280';
  };

  return (
    <div className="admin-stats">
      {/* Overview Cards */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-title">Danas</div>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-number">{stats.daily.assignments}</span>
              <span className="stat-label">zaduženja</span>
            </div>
            <div className="stat-secondary">
              <span className="stat-number">{stats.daily.quantity}</span>
              <span className="stat-label">komada</span>
            </div>
            <div className="stat-tertiary">
              <span className="stat-number">{stats.daily.newMaterials}</span>
              <span className="stat-label">novih materijala</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <BarChart3 size={24} />
            </div>
            <div className="stat-title">Ovaj mesec</div>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-number">{stats.monthly.assignments}</span>
              <span className="stat-label">zaduženja</span>
            </div>
            <div className="stat-secondary">
              <span className="stat-number">{stats.monthly.quantity}</span>
              <span className="stat-label">komada</span>
            </div>
            <div className="stat-tertiary">
              <span className="stat-number">{stats.monthly.newMaterials}</span>
              <span className="stat-label">novih materijala</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-title">Trend</div>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <div className="trend-indicator">
                {getTrendIcon(stats.trends.assignments)}
                <span className="trend-text" style={{ color: getTrendColor(stats.trends.assignments) }}>
                  {Math.abs(stats.trends.assignments).toFixed(1)}%
                </span>
              </div>
              <span className="stat-label">vs prošli mesec</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Package size={24} />
            </div>
            <div className="stat-title">Ukupno</div>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-number">{stats.totals.materials}</span>
              <span className="stat-label">materijala</span>
            </div>
            <div className="stat-secondary">
              <span className="stat-number">{stats.totals.employees}</span>
              <span className="stat-label">zaposlenih</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3 className="chart-title">
            <PieChart size={20} />
            Statistike po kategorijama
          </h3>
          <div className="category-stats">
            {Object.entries(stats.categories).map(([category, data]) => (
              <div key={category} className="category-item">
                <div className="category-header">
                  <span className="category-name">{category}</span>
                  <span className="category-count">{data.count} materijala</span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-fill"
                    style={{ 
                      width: `${(data.quantity / stats.totals.totalQuantity) * 100}%`,
                      background: `hsl(${Math.random() * 360}, 70%, 50%)`
                    }}
                  />
                </div>
                <div className="category-quantity">{data.quantity} komada</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">
            <BarChart3 size={20} />
            Statistike po odeljenjima
          </h3>
          <div className="department-stats">
            {Object.entries(stats.departments).map(([department, data]) => (
              <div key={department} className="department-item">
                <div className="department-header">
                  <span className="department-name">{department}</span>
                  <span className="department-count">{data.count} zaduženja</span>
                </div>
                <div className="department-bar">
                  <div 
                    className="department-fill"
                    style={{ 
                      width: `${(data.quantity / stats.totals.totalQuantity) * 100}%`,
                      background: `hsl(${Math.random() * 360}, 70%, 50%)`
                    }}
                  />
                </div>
                <div className="department-quantity">{data.quantity} komada</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Materials */}
      <div className="top-materials">
        <h3 className="section-title">
          <Package size={20} />
          Top 10 materijala po količini
        </h3>
        <div className="materials-list">
          {stats.topMaterials.map((material, index) => (
            <div key={material.id} className="material-item">
              <div className="material-rank">#{index + 1}</div>
              <div className="material-info">
                <div className="material-name">{material.name}</div>
                <div className="material-category">{material.category}</div>
              </div>
              <div className="material-quantity">{material.total} kom</div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStock.length > 0 && (
        <div className="low-stock-alert">
          <h3 className="section-title warning">
            <AlertTriangle size={20} />
            Materijali sa niskim stanjem ({stats.lowStock.length})
          </h3>
          <div className="low-stock-list">
            {stats.lowStock.map(material => (
              <div key={material.id} className="low-stock-item">
                <div className="material-info">
                  <div className="material-name">{material.name}</div>
                  <div className="material-category">{material.category}</div>
                </div>
                <div className="stock-info">
                  <div className="current-stock">{material.stockQuantity || 0}</div>
                  <div className="min-stock">min: {material.minStock || 0}</div>
                </div>
                <div className="stock-status">
                  <AlertTriangle size={16} className="text-red-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStats;
