import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
  Filter,
  Search,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import eventBus, { EVENTS } from '../services/eventBus';

const AdminDashboard = ({
  materials = [],
  materialsDB = [],
  employeesDB = [],
  assignments = [],
  currentPeriod,
  onRefresh
}) => {
  console.log('🚨🚨🚨 AdminDashboard COMPONENT RENDERED! 🚨🚨🚨');
  console.log('🔍 AdminDashboard props:', { materialsDB: materialsDB.length, assignments: assignments.length, employeesDB: employeesDB.length });

  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [activityFilter, setActivityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [localMaterialsDB, setLocalMaterialsDB] = useState(materialsDB);

  // Sinhronizuj lokalni state sa prop-om
  useEffect(() => {
    console.log('🔍 AdminDashboard: materialsDB prop changed, updating local state');
    setLocalMaterialsDB(materialsDB);
  }, [materialsDB]);

  // Real-time aktivnosti
  useEffect(() => {
    console.log('🔍 AdminDashboard: Setting up event listeners, assignments:', assignments.length);
    console.log('🔍 AdminDashboard: EventBus available:', !!eventBus);
    
    const handleAssignmentCreated = (data) => {
      console.log('🔍 AdminDashboard: Assignment created event received', data);

      // Ažuriraj stanje materijala u lokalnom state-u
      if (data.assignment && data.assignment.material && data.assignment.material.id) {
        setLocalMaterialsDB(prev => {
          const updated = prev.map(m =>
            m.id === data.assignment.material.id
              ? { ...m, stockQuantity: Math.max(0, m.stockQuantity - data.assignment.quantity) }
              : m
          );
          console.log('🔍 AdminDashboard: localMaterialsDB updated after assignment, material:', data.assignment.material.name);
          return updated;
        });
      }

      const newActivity = {
        id: Date.now(),
        type: 'assignment',
        title: 'Materijal zadužen',
        description: `${data.assignment.material.name} - ${data.assignment.quantity} ${data.assignment.material.unit}`,
        details: `Zadužen: ${data.assignment.employee.name} (${data.assignment.employee.department})`,
        timestamp: new Date(data.timestamp),
        status: 'success',
        icon: 'UserCheck',
        color: '#dc2626'
      };
      console.log('🔍 AdminDashboard: Adding activity:', newActivity);
      addActivity(newActivity);
    };

    const handleInventoryUpdated = (data) => {
      console.log('🔍 AdminDashboard: Inventory updated event received', data);

      // Ažuriraj stanje materijala u lokalnom state-u
      if (data.materialId && data.newStockQuantity !== undefined) {
        setLocalMaterialsDB(prev => {
          const updated = prev.map(m =>
            m.id === data.materialId
              ? { ...m, stockQuantity: data.newStockQuantity }
              : m
          );
          console.log('🔍 AdminDashboard: localMaterialsDB updated after inventory update, materialId:', data.materialId);
          return updated;
        });
      }

      const material = localMaterialsDB.find(m => m.id === data.materialId);
      if (material) {
        const newActivity = {
          id: Date.now() + 1,
          type: 'inventory',
          title: 'Stanje magacina ažurirano',
          description: `${material.name} - Novo stanje: ${data.newStockQuantity}`,
          details: `Kategorija: ${material.category}`,
          timestamp: new Date(data.timestamp),
          status: 'info',
          icon: 'Package',
          color: '#dc2626'
        };
        addActivity(newActivity);
      }
    };

    const handleMaterialCreated = (data) => {
      console.log('🚨🚨🚨 AdminDashboard: MATERIAL CREATED EVENT RECEIVED! 🚨🚨🚨');
      console.log('🔍 AdminDashboard: Current localMaterialsDB length:', localMaterialsDB.length);
      console.log('🔍 AdminDashboard: New material data:', data.material);

      // Dodaj novi materijal direktno u lokalni state
      setLocalMaterialsDB(prev => {
        const updated = [...prev, data.material];
        console.log('🚨🚨🚨 AdminDashboard: localMaterialsDB UPDATED! New length:', updated.length);
        console.log('🔍 AdminDashboard: Updated localMaterialsDB:', updated.map(m => ({ id: m.id, name: m.name, created_at: m.created_at })));
        return updated;
      });

      const newActivity = {
        id: Date.now() + 2,
        type: 'material',
        title: 'Novi materijal dodat',
        description: `${data.material.name} - ${data.material.stockQuantity} ${data.material.unit}`,
        details: `Kategorija: ${data.material.category}`,
        timestamp: new Date(data.timestamp),
        status: 'success',
        icon: 'Plus',
        color: '#dc2626'
      };
      addActivity(newActivity);
      console.log('🚨🚨🚨 AdminDashboard: Activity added, SHOULD TRIGGER STATS RECALCULATION! 🚨🚨🚨');
    };

    const handleMaterialUpdated = (data) => {
      console.log('🔍 AdminDashboard: Material updated event received', data);

      // Ažuriraj materijal u lokalnom state-u
      if (data.material && data.material.id) {
        setLocalMaterialsDB(prev => {
          const updated = prev.map(m =>
            m.id === data.material.id ? data.material : m
          );
          console.log('🔍 AdminDashboard: localMaterialsDB updated after material update, material:', data.material.name);
          return updated;
        });
      }

      const newActivity = {
        id: Date.now() + 3,
        type: 'material',
        title: 'Materijal ažuriran',
        description: `${data.material.name} - Novo stanje: ${data.material.stockQuantity} ${data.material.unit}`,
        details: `Kategorija: ${data.material.category}`,
        timestamp: new Date(data.timestamp),
        status: 'info',
        icon: 'Package',
        color: '#dc2626'
      };
      addActivity(newActivity);
    };

    const handleMaterialDeleted = (data) => {
      console.log('AdminDashboard: Material deleted event received', data);
      const material = localMaterialsDB.find(m => m.id === data.materialId);
      const newActivity = {
        id: Date.now() + 4,
        type: 'material',
        title: 'Materijal obrisan',
        description: material ? `${material.name} - ${material.category}` : `ID: ${data.materialId}`,
        details: 'Materijal je uklonjen iz magacina',
        timestamp: new Date(data.timestamp),
        status: 'error',
        icon: 'Trash2',
        color: '#dc2626'
      };
      addActivity(newActivity);
      setLastRefresh(new Date());
    };

    const handleEmployeeUpdated = (data) => {
      console.log('AdminDashboard: Employee updated event received', data);
      const newActivity = {
        id: Date.now() + 3,
        type: 'employee',
        title: 'Zaposleni ažuriran',
        description: `${data.employee.name} - ${data.employee.department}`,
        details: `Pozicija: ${data.employee.position || 'N/A'}`,
        timestamp: new Date(),
        status: 'info',
        icon: 'Users',
        color: '#dc2626'
      };
      addActivity(newActivity);
      setLastRefresh(new Date());
    };

    const handleEmployeeDeleted = (data) => {
      console.log('AdminDashboard: Employee deleted event received', data);
      const newActivity = {
        id: Date.now() + 5,
        type: 'employee',
        title: 'Zaposleni obrisan',
        description: `${data.employee.name} - ${data.employee.department}`,
        details: `Pozicija: ${data.employee.position || 'N/A'}`,
        timestamp: new Date(),
        status: 'warning',
        icon: 'Users',
        color: '#dc2626'
      };
      addActivity(newActivity);
      setLastRefresh(new Date());
    };

    const handleAdminRefreshNeeded = (data) => {
      console.log('AdminDashboard: Admin refresh needed event received', data);
      setLastRefresh(new Date());
      if (onRefresh) {
        onRefresh();
      }
    };

    // Pretplata na eventove
    console.log('🔍 AdminDashboard: Subscribing to events...');
    const unsubscribeAssignment = eventBus.subscribe(EVENTS.ASSIGNMENT_CREATED, handleAssignmentCreated);
    const unsubscribeInventory = eventBus.subscribe(EVENTS.INVENTORY_UPDATED, handleInventoryUpdated);
    const unsubscribeMaterial = eventBus.subscribe(EVENTS.MATERIAL_CREATED, handleMaterialCreated);
    console.log('🔍 AdminDashboard: Events subscribed successfully!');
    const unsubscribeMaterialUpdated = eventBus.subscribe(EVENTS.MATERIAL_UPDATED, handleMaterialUpdated);
    const unsubscribeMaterialDeleted = eventBus.subscribe(EVENTS.MATERIAL_DELETED, handleMaterialDeleted);
    const unsubscribeEmployee = eventBus.subscribe(EVENTS.EMPLOYEE_UPDATED, handleEmployeeUpdated);
    const unsubscribeEmployeeDeleted = eventBus.subscribe(EVENTS.EMPLOYEE_DELETED, handleEmployeeDeleted);
    const unsubscribeRefresh = eventBus.subscribe(EVENTS.ADMIN_REFRESH_NEEDED, handleAdminRefreshNeeded);

    return () => {
      console.log('AdminDashboard: Cleaning up event listeners');
      unsubscribeAssignment();
      unsubscribeInventory();
      unsubscribeMaterial();
      unsubscribeMaterialUpdated();
      unsubscribeMaterialDeleted();
      unsubscribeEmployee();
      unsubscribeEmployeeDeleted();
      unsubscribeRefresh();
    };
  }, [localMaterialsDB, onRefresh, assignments]);

  const addActivity = (activity) => {
    setActivities(prev => [activity, ...prev.slice(0, 99)]); // Zadržavamo poslednjih 100 aktivnosti
  };

  // Inicijalne aktivnosti - prazne, samo real-time
  useEffect(() => {
    setActivities([]);
  }, []);

  // Ažuriranje aktivnosti kada se assignments promene
  useEffect(() => {
    console.log('🔍 AdminDashboard: Assignments changed, creating activities:', assignments.length);
    
    if (assignments.length > 0) {
      const newActivities = assignments.map((assignment, index) => {
        const material = localMaterialsDB.find(m => m.id === assignment.material_id);
        const employee = employeesDB.find(e => e.id === assignment.employee_id);
        
        if (material && employee) {
          return {
            id: assignment.id || Date.now() + index,
            type: 'assignment',
            title: 'Materijal zadužen',
            description: `${material.name} - ${assignment.quantity} ${material.unit}`,
            details: `Zadužen: ${employee.name} (${employee.department})`,
            timestamp: new Date(assignment.date || assignment.created_at),
            status: 'success',
            icon: 'UserCheck',
            color: '#dc2626'
          };
        }
        return null;
      }).filter(Boolean);
      
      console.log('🔍 AdminDashboard: Created activities from assignments:', newActivities);
      setActivities(newActivities);
    }
  }, [assignments, localMaterialsDB, employeesDB]);

  // Reagovanje na promene u localMaterialsDB
  useEffect(() => {
    console.log('🔍 AdminDashboard: localMaterialsDB changed, length:', localMaterialsDB.length);
    console.log('🔍 AdminDashboard: localMaterialsDB items:', localMaterialsDB.map(m => ({ id: m.id, name: m.name, created_at: m.created_at })));
    console.log('🔍 AdminDashboard: Force re-render triggered!');

    // Dodatni debug - proveri današnje materijale
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayMaterials = localMaterialsDB.filter(m => {
      const materialDate = new Date(m.created_at);
      return materialDate >= todayStart;
    });
    console.log('🔍 AdminDashboard: Today materials count:', todayMaterials.length);
    console.log('🔍 AdminDashboard: Today materials:', todayMaterials.map(m => ({ name: m.name, created_at: m.created_at })));

    // Force re-render by updating a dummy state
    setLastRefresh(new Date());
  }, [localMaterialsDB]);

  // Filtriranje aktivnosti
  useEffect(() => {
    let filtered = activities;

    if (activityFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === activityFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  }, [activities, activityFilter, searchTerm]);

  // Statistike
  const stats = useMemo(() => {
    console.log('🔍 AdminDashboard: Recalculating stats, localMaterialsDB length:', localMaterialsDB.length);
    console.log('🔍 AdminDashboard: Stats useMemo triggered!');
    console.log('🔍 AdminDashboard: lastRefresh:', lastRefresh);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Dnevne statistike - assignments
    const todayAssignments = assignments.filter(a => {
      const assignmentDate = new Date(a.created_at);
      return assignmentDate >= todayStart;
    }).length;

    // Dnevne statistike - novi materijali (kao u AdminStats)
    const todayMaterials = localMaterialsDB.filter(m => {
      const materialDate = new Date(m.created_at);
      return materialDate >= todayStart;
    }).length;

    // Mesečne statistike - assignments
    const monthAssignments = assignments.filter(a => {
      const assignmentDate = new Date(a.created_at);
      return assignmentDate >= monthStart;
    }).length;

    // Mesečne statistike - novi materijali (kao u AdminStats)
    const monthMaterials = localMaterialsDB.filter(m => {
      const materialDate = new Date(m.created_at);
      return materialDate >= monthStart;
    }).length;

    console.log('🔍 AdminDashboard: todayMaterials:', todayMaterials);
    console.log('🔍 AdminDashboard: monthMaterials:', monthMaterials);

    // Ukupne statistike
    const totalMaterials = localMaterialsDB.length;
    const totalEmployees = employeesDB.length;
    const totalAssignments = assignments.reduce((sum, a) => sum + a.quantity, 0);
    const lowStockCount = localMaterialsDB.filter(m => (m?.stockQuantity || 0) <= (m?.minStock || 0)).length;
    
    // Trendovi
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);
    
    const yesterdayAssignments = activities.filter(a => 
      a.type === 'assignment' && a.timestamp >= yesterdayStart && a.timestamp < yesterdayEnd
    ).length;
    
    const assignmentTrend = yesterdayAssignments > 0 
      ? ((todayAssignments - yesterdayAssignments) / yesterdayAssignments) * 100 
      : 0;

    return {
      today: {
        assignments: todayAssignments,
        materials: todayMaterials,
        activities: activities.filter(a => a.timestamp >= todayStart).length
      },
      month: {
        assignments: monthAssignments,
        materials: monthMaterials,
        activities: activities.filter(a => a.timestamp >= monthStart).length
      },
      total: {
        materials: totalMaterials,
        employees: totalEmployees,
        assignments: totalAssignments,
        lowStock: lowStockCount
      },
      trends: {
        assignments: assignmentTrend
      }
    };
  }, [activities, localMaterialsDB, employeesDB, assignments, lastRefresh]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setLastRefresh(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getActivityIcon = (iconName) => {
    const icons = {
      UserCheck: CheckCircle,
      Package: Package,
      Plus: Package,
      Users: Users,
      AlertTriangle: AlertTriangle
    };
    return icons[iconName] || Activity;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Upravo sada';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowUpRight size={16} className="text-green-500" />;
    if (trend < 0) return <ArrowDownRight size={16} className="text-red-500" />;
    return <Minus size={16} className="text-gray-500" />;
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">
              Pregled aktivnosti magacina potrošnog materijala
            </p>
          </div>
          <div className="header-actions">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="refresh-btn"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Osvežavam...' : 'Osveži'}
            </button>
            <div className="last-refresh">
              Poslednje: {lastRefresh.toLocaleTimeString('sr-RS')}
            </div>
          </div>
        </div>
      </div>

      {/* Statistike */}
      <div className="stats-grid">
        {/* Dnevne statistike */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-title">Danas</div>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-number">{stats.today.assignments}</span>
              <span className="stat-label">zaduženja</span>
            </div>
            <div className="stat-secondary">
              <span className="stat-number">{stats.today.materials}</span>
              <span className="stat-label">novi materijali</span>
            </div>
          </div>
        </div>

        {/* Mesečne statistike */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <BarChart3 size={24} />
            </div>
            <div className="stat-title">Ovaj mesec</div>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-number">{stats.month.assignments}</span>
              <span className="stat-label">zaduženja</span>
            </div>
            <div className="stat-secondary">
              <span className="stat-number">{stats.month.materials}</span>
              <span className="stat-label">novi materijali</span>
            </div>
          </div>
        </div>

        {/* Ukupne statistike */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Package size={24} />
            </div>
            <div className="stat-title">Ukupno</div>
          </div>
          <div className="stat-content">
            <div className="stat-main">
              <span className="stat-number">{stats.total.materials}</span>
              <span className="stat-label">materijala</span>
            </div>
            <div className="stat-secondary">
              <span className="stat-number">{stats.total.employees}</span>
              <span className="stat-label">zaposlenih</span>
            </div>
          </div>
        </div>

        {/* Trend */}
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
                <span className="trend-text">
                  {Math.abs(stats.trends.assignments).toFixed(1)}%
                </span>
              </div>
              <span className="stat-label">vs juče</span>
            </div>
          </div>
        </div>

        {/* Nisko stanje */}
        {stats.total.lowStock > 0 && (
          <div className="stat-card warning">
            <div className="stat-header">
              <div className="stat-icon">
                <AlertTriangle size={24} />
              </div>
              <div className="stat-title">Upozorenje</div>
            </div>
            <div className="stat-content">
              <div className="stat-main">
                <span className="stat-number">{stats.total.lowStock}</span>
                <span className="stat-label">nisko stanje</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Aktivnosti */}
      <div className="activities-section">
        <div className="section-header">
          <h2 className="section-title">
            <Activity size={24} />
            Poslednje aktivnosti
          </h2>
          <div className="section-controls">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Pretraži aktivnosti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Sve aktivnosti</option>
              <option value="assignment">Zaduženja</option>
              <option value="inventory">Magacin</option>
              <option value="material">Materijali</option>
              <option value="employee">Zaposleni</option>
            </select>
          </div>
        </div>

        <div className="activities-list">
          <AnimatePresence>
            {filteredActivities.map((activity, index) => {
              const IconComponent = getActivityIcon(activity.icon);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="activity-item"
                >
                  <div className="activity-icon" style={{ color: activity.color }}>
                    <IconComponent size={20} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-header">
                      <h4 className="activity-title">{activity.title}</h4>
                      <span className="activity-time">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <p className="activity-description">{activity.description}</p>
                    <p className="activity-details">{activity.details}</p>
                  </div>
                  <div className={`activity-status ${activity.status}`}>
                    {activity.status === 'success' && <CheckCircle size={16} />}
                    {activity.status === 'error' && <XCircle size={16} />}
                    {activity.status === 'info' && <Clock size={16} />}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredActivities.length === 0 && (
          <div className="empty-state">
            <Activity size={48} className="empty-icon" />
            <h3>Nema aktivnosti</h3>
            <p>Nema aktivnosti koje odgovaraju vašim filterima.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
