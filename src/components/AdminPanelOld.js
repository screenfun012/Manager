import React, { useState, useEffect } from 'react';
import { Database, Trash2, BarChart3, AlertTriangle, CheckCircle, Clock, HardDrive, Settings, FileDown, Palette, Shield, RefreshCw, LogOut } from 'lucide-react';
import { getDatabaseInfo, runCleanup, rebuildCache } from '../services/api';
import eventBus, { EVENTS } from '../services/eventBus';
import sseService from '../services/sseService';
import AdminLogin from './AdminLogin';
import EmployeeManagement from './EmployeeManagement';
import SimpleDashboard from './SimpleDashboard';

const AdminPanel = ({ currentPeriod }) => {
  const [databaseInfo, setDatabaseInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(null);
  
  // Real-time dashboard state
  const [dashboardData, setDashboardData] = useState({
    totalAssignments: 0,
    assignmentsToday: 0,
    assignmentsThisMonth: 0,
    newAssignments7Days: 0,
    totalMaterials: 0,
    totalEmployees: 0,
    lowStockCount: 0,
    topMaterials: [],
    lowStockMaterials: [],
    assignmentsByUser: [],
    assignmentsByDepartment: [],
    dailyTrend: [],
    avgDailyAssignments: 0,
    lastUpdated: null
  });

  // Debug log za dashboardData promene
  useEffect(() => {
    console.log('🔄 Dashboard data changed:', dashboardData);
  }, [dashboardData]);
  
  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  
  // Podešavanja sa default vrednostima
  const [settings, setSettings] = useState({
    exportDirectory: '/Users/Desktop/Exports', // Default export direktorijum
    defaultTemplate: 'excel',
    logLevel: 'INFO',
    theme: 'dark',
    apiKey: '',
    smtpKey: '',
    dateRange: '30', // default: poslednjih 30 dana
    warehouse: 'main', // default: glavni magacin
    unit: 'kom', // default: komad
    currency: 'RSD', // default: dinari
    currentRole: 'admin' // default uloga
  });

  // Default parametri za sprečavanje undefined stanja
  const [defaultParams, setDefaultParams] = useState({
    dateRange: '30',
    warehouse: 'main',
    unit: 'kom',
    currency: 'RSD',
    roles: ['admin', 'magacioner', 'korisnik'],
    permissions: {
      admin: ['read', 'write', 'delete', 'manage'],
      magacioner: ['read', 'write'],
      korisnik: ['read']
    }
  });

  useEffect(() => {
    checkAuthStatus();
    loadSettings();
    
    // Connect to SSE
    sseService.connect();
    
    return () => {
      sseService.disconnect();
    };
  }, []);

  // Učitaj podatke kada se komponenta montira i kada se autentifikuje
  useEffect(() => {
    if (isAuthenticated && !databaseInfo) {
      loadDatabaseInfo();
    }
  }, [isAuthenticated]);

  // Učitaj podatke kada se komponenta ponovo mount-uje ili kada se vrati u Admin panel
  useEffect(() => {
    if (isAuthenticated) {
      // Uvek učitaj podatke kada se komponenta mount-uje
      loadDatabaseInfo();
    }
  }, []); // Prazan dependency array - samo pri mount-u

  // Event listeners za real-time ažuriranje - samo kada se nešto stvarno promeni
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('🔊 Admin Panel: Setting up event listeners...');

    const unsubscribeAssignmentCreated = eventBus.subscribe(EVENTS.ASSIGNMENT_CREATED, (data) => {
      console.log('🔄 Admin Panel: Assignment created event received:', data);
      // Ažuriraj statistike odmah sa debouncing-om da se ne poziva previše puta
      setTimeout(() => loadDatabaseInfo(), 500);
      showToast('Nova transakcija zabeležena - statistike ažurirane', 'success');
    });

    const unsubscribeAssignmentUpdated = eventBus.subscribe(EVENTS.ASSIGNMENT_UPDATED, (data) => {
      console.log('🔄 Admin Panel: Assignment updated event received:', data);
      setTimeout(() => loadDatabaseInfo(), 500);
      showToast('Transakcija ažurirana - statistike ažurirane', 'success');
    });

    const unsubscribeAssignmentDeleted = eventBus.subscribe(EVENTS.ASSIGNMENT_DELETED, (data) => {
      console.log('🔄 Admin Panel: Assignment deleted event received:', data);
      setTimeout(() => loadDatabaseInfo(), 500);
      showToast('Transakcija obrisana - statistike ažurirane', 'success');
    });

    const unsubscribeInventoryUpdated = eventBus.subscribe(EVENTS.INVENTORY_UPDATED, (data) => {
      console.log('🔄 Admin Panel: Inventory updated event received:', data);
      // Ažuriraj statistike odmah sa debouncing-om
      setTimeout(() => loadDatabaseInfo(), 500);
    });

    const unsubscribeMaterialUpdated = eventBus.subscribe(EVENTS.MATERIAL_UPDATED, (data) => {
      console.log('🔄 Admin Panel: Material updated event received:', data);
      setTimeout(() => loadDatabaseInfo(), 500);
      showToast('Materijal ažuriran - statistike ažurirane', 'success');
    });

    const unsubscribeEmployeeUpdated = eventBus.subscribe(EVENTS.EMPLOYEE_UPDATED, (data) => {
      console.log('🔄 Admin Panel: Employee updated event received:', data);
      setTimeout(() => loadDatabaseInfo(), 500);
      showToast('Zaposleni ažuriran - statistike ažurirane', 'success');
    });

    const unsubscribeDepartmentUpdated = eventBus.subscribe(EVENTS.DEPARTMENT_UPDATED, (data) => {
      console.log('🔄 Admin Panel: Department updated event received:', data);
      setTimeout(() => loadDatabaseInfo(), 500);
      showToast('Odeljenje ažurirano - statistike ažurirane', 'success');
    });

    const unsubscribeMaterialCreated = eventBus.subscribe(EVENTS.MATERIAL_CREATED, (data) => {
      console.log('🔄 Admin Panel: Material created event received:', data);
      setTimeout(() => loadDatabaseInfo(), 500);
      showToast('Novi materijal dodat - statistike ažurirane', 'success');
    });

    const unsubscribeMaterialDeleted = eventBus.subscribe(EVENTS.MATERIAL_DELETED, (data) => {
      console.log('🔄 Admin Panel: Material deleted event received:', data);
      setTimeout(() => loadDatabaseInfo(), 500);
      showToast('Materijal obrisan - statistike ažurirane', 'success');
    });

    const unsubscribeEmployeeCreated = eventBus.subscribe(EVENTS.EMPLOYEE_CREATED, (data) => {
      console.log('🔄 Admin Panel: Employee created event received:', data);
      setTimeout(() => loadDatabaseInfo(), 500);
      showToast('Novi zaposleni dodat - statistike ažurirane', 'success');
    });

    const unsubscribeEmployeeDeleted = eventBus.subscribe(EVENTS.EMPLOYEE_DELETED, (data) => {
      console.log('🔄 Admin Panel: Employee deleted event received:', data);
      setTimeout(() => loadDatabaseInfo(), 500);
      showToast('Zaposleni obrisan - statistike ažurirane', 'success');
    });

    const unsubscribeDepartmentCreated = eventBus.subscribe(EVENTS.DEPARTMENT_CREATED, (data) => {
      console.log('🔄 Admin Panel: Department created event received:', data);
      setTimeout(() => loadDatabaseInfo(), 500);
      showToast('Novo odeljenje dodato - statistike ažurirane', 'success');
    });

    const unsubscribeDepartmentDeleted = eventBus.subscribe(EVENTS.DEPARTMENT_DELETED, (data) => {
      console.log('🔄 Admin Panel: Department deleted event received:', data);
      setTimeout(() => loadDatabaseInfo(), 500);
      showToast('Odeljenje obrisano - statistike ažurirane', 'success');
    });

    const unsubscribeDataSyncNeeded = eventBus.subscribe(EVENTS.DATA_SYNC_NEEDED, (data) => {
      console.log('🔄 Admin Panel: Data sync needed event received:', data);
      console.log('🔄 Admin Panel: Calling loadDatabaseInfo...');
      setTimeout(() => {
        console.log('🔄 Admin Panel: About to call loadDatabaseInfo...');
        loadDatabaseInfo();
      }, 500);
      showToast('Sinhronizacija podataka - statistike ažurirane', 'success');
    });

    const unsubscribeAdminRefreshNeeded = eventBus.subscribe(EVENTS.ADMIN_REFRESH_NEEDED, (data) => {
      console.log('🔄 Admin Panel: Refresh needed event received:', data);
      // Ažuriraj statistike odmah
      loadDatabaseInfo();
    });

    // Dodaj i window.eventBus listener za kompatibilnost
    const handleWindowEvent = (event) => {
      console.log('🔄 Admin Panel: Window event received:', event.detail);
      if (event.detail && event.detail.type) {
        setTimeout(() => loadDatabaseInfo(), 500);
        showToast('Podaci ažurirani - statistike ažurirane', 'success');
      }
    };

    window.addEventListener('MATERIAL_UPDATED', handleWindowEvent);

    // Cleanup event listeners
    return () => {
      console.log('🔇 Admin Panel: Cleaning up event listeners...');
      unsubscribeAssignmentCreated();
      unsubscribeAssignmentUpdated();
      unsubscribeAssignmentDeleted();
      unsubscribeInventoryUpdated();
      unsubscribeMaterialUpdated();
      unsubscribeMaterialCreated();
      unsubscribeMaterialDeleted();
      unsubscribeEmployeeUpdated();
      unsubscribeEmployeeCreated();
      unsubscribeEmployeeDeleted();
      unsubscribeDepartmentUpdated();
      unsubscribeDepartmentCreated();
      unsubscribeDepartmentDeleted();
      unsubscribeDataSyncNeeded();
      unsubscribeAdminRefreshNeeded();
      window.removeEventListener('MATERIAL_UPDATED', handleWindowEvent);
    };
  }, [isAuthenticated]);

  // Proveri da li je korisnik već autentifikovan
  const checkAuthStatus = () => {
    try {
      const authData = localStorage.getItem('adminAuth');
      if (authData) {
        const { timestamp } = JSON.parse(authData);
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000; // 30 minuta u milisekundama
        
        if (now - timestamp < thirtyMinutes) {
          setIsAuthenticated(true);
          // Uklonjeno automatsko izlogovanje - korisnik će se izlogovati ručno
          // setAuthTimeout(setTimeout(() => {
          //   handleLogout();
          // }, thirtyMinutes - (now - timestamp)));
        } else {
          localStorage.removeItem('adminAuth');
        }
      }
    } catch (error) {
      console.error('Greška pri proveri autentifikacije:', error);
      localStorage.removeItem('adminAuth');
    }
  };

  // Rukovanje prijavljivanjem
  const handleLogin = (success) => {
    if (success) {
      setIsAuthenticated(true);
      loadDatabaseInfo();
      
      // Postavi timeout za auto-logout
      const timeout = setTimeout(() => {
        handleLogout();
      }, 30 * 60 * 1000); // 30 minuta
      setAuthTimeout(timeout);
    }
  };

  // Rukovanje odjavljivanjem
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    if (authTimeout) {
      clearTimeout(authTimeout);
      setAuthTimeout(null);
    }
    setDatabaseInfo(null);
  };

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Greška pri učitavanju podešavanja:', error);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      setMessage('Podešavanja su uspešno sačuvana!', 'success');
    } catch (error) {
      console.error('Greška pri čuvanju podešavanja:', error);
      setMessage('Greška pri čuvanju podešavanja', 'error');
    }
  };

  const loadDatabaseInfo = async () => {
    console.log('🔄 Admin Panel: loadDatabaseInfo called');
    try {
      setIsLoading(true);
      const info = await getDatabaseInfo(currentPeriod);
      
      // Osiguraj da su svi parametri definisani sa default vrednostima
      const safeInfo = {
        ...info,
        totalMaterials: info?.totalMaterials ?? 0,
        totalEmployees: info?.totalEmployees ?? 0,
        totalAssignments: info?.totalAssignments ?? 0,
        newAssignments7Days: info?.newAssignments7Days ?? 0,
        assignmentsToday: info?.assignmentsToday ?? 0,
        assignmentsThisMonth: info?.assignmentsThisMonth ?? 0,
        topMaterials: info?.topMaterials ?? [],
        lowStockMaterials: info?.lowStockMaterials ?? [],
        lowStockCount: info?.lowStockCount ?? 0,
        assignmentsByUser: info?.assignmentsByUser ?? [],
        assignmentsByDepartment: info?.assignmentsByDepartment ?? [],
        dailyTrend: info?.dailyTrend ?? [],
        avgDailyAssignments: info?.avgDailyAssignments ?? 0,
        status: info?.status ?? 'UNKNOWN',
        warnings: info?.warnings ?? [],
        databaseSize: info?.databaseSize ?? 0,
        growthTrend: info?.growthTrend ?? 0,
        projectedSize: info?.projectedSize ?? 0,
        autoCleanupEnabled: info?.autoCleanupEnabled ?? false,
        lastCleanup: info?.lastCleanup ?? null,
        lastUpdated: info?.lastUpdated ?? new Date().toISOString()
      };

      // Ažuriraj default parametre ako su stigli sa servera
      if (info?.defaultParams) {
        setDefaultParams(prevParams => ({
          ...prevParams,
          ...info.defaultParams
        }));
      }

      setDatabaseInfo(safeInfo);
      
      console.log('🔄 Admin Panel: Updating dashboard data with:', {
        totalAssignments: safeInfo.totalAssignments,
        assignmentsToday: safeInfo.assignmentsToday,
        lowStockCount: safeInfo.lowStockCount
      });
      
      // Ažuriraj dashboard podatke
      const newDashboardData = {
        totalAssignments: safeInfo.totalAssignments,
        assignmentsToday: safeInfo.assignmentsToday,
        assignmentsThisMonth: safeInfo.assignmentsThisMonth,
        newAssignments7Days: safeInfo.newAssignments7Days,
        totalMaterials: safeInfo.totalMaterials,
        totalEmployees: safeInfo.totalEmployees,
        lowStockCount: safeInfo.lowStockCount,
        topMaterials: safeInfo.topMaterials,
        lowStockMaterials: safeInfo.lowStockMaterials,
        assignmentsByUser: safeInfo.assignmentsByUser,
        assignmentsByDepartment: safeInfo.assignmentsByDepartment,
        dailyTrend: safeInfo.dailyTrend,
        avgDailyAssignments: safeInfo.avgDailyAssignments,
        lastUpdated: new Date().toLocaleTimeString()
      };
      
      console.log('🔄 Admin Panel: Setting dashboard data:', newDashboardData);
      setDashboardData(newDashboardData);
      
    } catch (error) {
      console.error('Greška pri učitavanju informacija o bazi:', error);
      setMessage('Greška pri učitavanju informacija o bazi podataka', 'error');
      
      // Postavi osnovne default vrednosti u slučaju greške
      setDatabaseInfo({
        totalMaterials: 0,
        totalEmployees: 0,
        totalAssignments: 0,
        newAssignments7Days: 0,
        assignmentsToday: 0,
        assignmentsThisMonth: 0,
        topMaterials: [],
        lowStockMaterials: [],
        lowStockCount: 0,
        assignmentsByUser: [],
        assignmentsByDepartment: [],
        dailyTrend: [],
        avgDailyAssignments: 0,
        status: 'ERROR',
        warnings: ['Greška pri povezivanju sa bazom podataka'],
        databaseSize: 0,
        growthTrend: 0,
        projectedSize: 0,
        autoCleanupEnabled: false,
        lastCleanup: null,
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcija za potvrdu akcije
  const confirmDestructiveAction = (actionFn, message) => {
    setConfirmAction(() => actionFn);
    setConfirmMessage(message);
    setShowConfirmModal(true);
  };

  // Funkcija za izvršavanje potvrđene akcije
  const executeConfirmedAction = async () => {
    setShowConfirmModal(false);
    if (confirmAction) {
      await confirmAction();
    }
    setConfirmAction(null);
    setConfirmMessage('');
  };

  // Funkcija za prikaz toast poruke
  const showToast = (msg, type = 'info', duration = 5000) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, duration);
  };

  const handleCleanup = async () => {
    try {
      setIsLoading(true);
      console.log('🧹 Pokretanje čišćenja baze...');
      
      const result = await runCleanup();
      
      if (result.success) {
        const details = result.details;
        showToast(
          `Čišćenje završeno! Trajanje: ${details.duration}, Oslobođeno: ${details.spaceSaved}`, 
          'success', 
          7000
        );
        console.log('✅ Čišćenje uspešno:', details);
      } else {
        showToast('Čišćenje završeno, ali bez detalja o rezultatu', 'success');
      }
      
      await loadDatabaseInfo(); // Osvežavamo informacije
    } catch (error) {
      console.error('❌ Greška pri čišćenju:', error);
      showToast(`Greška pri čišćenju: ${error.message || 'Nepoznata greška'}`, 'error', 10000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRebuildCache = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Pokretanje rebuild keša...');
      
      const result = await rebuildCache();
      
      if (result.success) {
        const details = result.details;
        showToast(
          `Rebuild završen! Trajanje: ${details.duration}, Operacije: ${details.operations.length}`, 
          'success', 
          7000
        );
        console.log('✅ Rebuild uspešan:', details);
      } else {
        showToast('Rebuild završen, ali bez detalja o rezultatu', 'success');
      }
      
      await loadDatabaseInfo(); // Osvežavamo informacije
    } catch (error) {
      console.error('❌ Greška pri rebuild-u:', error);
      showToast(`Greška pri rebuild-u: ${error.message || 'Nepoznata greška'}`, 'error', 10000);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('sr-RS');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OK': return 'text-green-600';
      case 'WARNING': return 'text-yellow-600';
      case 'CRITICAL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OK': return <CheckCircle size={20} className="text-green-600" />;
      case 'WARNING': return <AlertTriangle size={20} className="text-yellow-600" />;
      case 'CRITICAL': return <AlertTriangle size={20} className="text-red-600" />;
      default: return <Clock size={20} className="text-gray-600" />;
    }
  };

  // Ako nije autentifikovan, prikaži login ekran
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} isLoading={isLoading} />;
  }

  if (isLoading && !databaseInfo) {
    return (
      <div className="card">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          color: '#ffffff'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #374151',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '1rem'
          }}></div>
          <span>Učitavam informacije o bazi podataka...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '1.5rem',
          fontWeight: '600',
          margin: 0
        }}>
          <Settings size={28} style={{ color: '#3b82f6' }} />
          Admin Panel - Upravljanje Bazom Podataka
        </h2>

        {/* Admin Panel Tabovi */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setActiveAdminTab('dashboard')}
            style={{
              background: activeAdminTab === 'dashboard' ? '#3b82f6' : '#374151',
              border: '2px solid #4b5563',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Database size={16} />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveAdminTab('employees')}
            style={{
              background: activeAdminTab === 'employees' ? '#3b82f6' : '#374151',
              border: '2px solid #4b5563',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Shield size={16} />
            Zaposleni
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={loadDatabaseInfo}
            disabled={isLoading}
            style={{
              background: isLoading ? '#6b7280' : '#374151',
              border: `2px solid ${isLoading ? '#4b5563' : '#4b5563'}`,
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={16} style={{ 
              animation: isLoading ? 'spin 1s linear infinite' : 'none' 
            }} />
            Refresh
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              background: '#dc2626',
              border: '2px solid #b91c1c',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
      
      <p style={{
        color: '#d1d5db',
        marginBottom: '2rem',
        fontSize: '1rem'
      }}>
        Pratite stanje baze podataka i upravljajte automatskim održavanjem
      </p>

      {message && (
        <div style={{
          background: messageType === 'success' ? '#059669' : '#dc2626',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          {message}
        </div>
      )}

      {/* Uslovno renderovanje sadržaja na osnovu aktivnog taba */}
      {activeAdminTab === 'dashboard' && (
        <SimpleDashboard currentPeriod={currentPeriod} />
      )}

      {activeAdminTab === 'employees' && (
        <EmployeeManagement />
      )}

      {activeAdminTab === 'settings' && (
        <div>

      {/* Glavne metrike - Izdavanja */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: '#1f2937',
          border: '2px solid #374151',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Database size={28} style={{ color: '#3b82f6', marginRight: '1rem' }} />
            <div>
              <p style={{ color: '#d1d5db', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Ukupno izdavanja</p>
              <p style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '600' }}>
                {dashboardData.totalAssignments}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: '#1f2937',
          border: '2px solid #374151',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Clock size={28} style={{ color: '#10b981', marginRight: '1rem' }} />
            <div>
              <p style={{ color: '#d1d5db', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Danas</p>
              <p style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '600' }}>
                {dashboardData.assignmentsToday}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: '#1f2937',
          border: '2px solid #374151',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BarChart3 size={28} style={{ color: '#f59e0b', marginRight: '1rem' }} />
            <div>
              <p style={{ color: '#d1d5db', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Poslednih 7 dana</p>
              <p style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '600' }}>
                {dashboardData.newAssignments7Days}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: '#1f2937',
          border: '2px solid #374151',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <HardDrive size={28} style={{ color: '#7c3aed', marginRight: '1rem' }} />
            <div>
              <p style={{ color: '#d1d5db', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Tekući mesec</p>
              <p style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '600' }}>
                {dashboardData.assignmentsThisMonth}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: '#1f2937',
          border: '2px solid #374151',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AlertTriangle size={28} style={{ color: '#dc2626', marginRight: '1rem' }} />
            <div>
              <p style={{ color: '#d1d5db', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Niske zalihe</p>
              <p style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '600' }}>
                {dashboardData.lowStockCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analitika - Top materijali i izdavanja */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Top 10 materijala */}
        <div style={{
          background: '#1f2937',
          border: '2px solid #374151',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            color: '#ffffff',
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <BarChart3 size={20} style={{ color: '#10b981' }} />
            Top 10 materijala (30 dana)
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {dashboardData.topMaterials && dashboardData.topMaterials.length > 0 ? (
              dashboardData.topMaterials.map((material, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: index < databaseInfo.topMaterials.length - 1 ? '1px solid #374151' : 'none'
                }}>
                  <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>
                    {index + 1}. {material.name}
                  </span>
                  <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.9rem' }}>
                    {material.count}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>
                Nema podataka za poslednih 30 dana
              </p>
            )}
          </div>
        </div>

        {/* Izdavanja po korisnicima */}
        <div style={{
          background: '#1f2937',
          border: '2px solid #374151',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            color: '#ffffff',
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Database size={20} style={{ color: '#7c3aed' }} />
            Izdavanja po korisnicima (30 dana)
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {dashboardData.assignmentsByUser && dashboardData.assignmentsByUser.length > 0 ? (
              dashboardData.assignmentsByUser.map((user, index) => (
                <div key={index} style={{
                  padding: '0.5rem 0',
                  borderBottom: index < dashboardData.assignmentsByUser.length - 1 ? '1px solid #374151' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: '500' }}>
                        {user.name}
                      </span>
                      <br />
                      <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                        {user.department}
                      </span>
                    </div>
                    <span style={{ color: '#7c3aed', fontWeight: '600', fontSize: '0.9rem' }}>
                      {user.count}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>
                Nema podataka za poslednih 30 dana
              </p>
            )}
          </div>
        </div>

        {/* Niske zalihe */}
        <div style={{
          background: '#1f2937',
          border: '2px solid #374151',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            color: '#ffffff',
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={20} style={{ color: '#dc2626' }} />
            Materijali sa niskim zalihama
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {dashboardData.lowStockMaterials && dashboardData.lowStockMaterials.length > 0 ? (
              dashboardData.lowStockMaterials.map((material, index) => (
                <div key={index} style={{
                  padding: '0.5rem 0',
                  borderBottom: index < dashboardData.lowStockMaterials.length - 1 ? '1px solid #374151' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: '500' }}>
                        {material.name}
                      </span>
                      <br />
                      <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                        Min: {material.minQuantity}
                      </span>
                    </div>
                    <span style={{ 
                      color: material.quantity === 0 ? '#dc2626' : '#f59e0b', 
                      fontWeight: '600', 
                      fontSize: '0.9rem' 
                    }}>
                      {material.quantity}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#10b981', textAlign: 'center', padding: '2rem 0' }}>
                ✅ Sve zalihe su na dovoljnom nivou
              </p>
            )}
          </div>
        </div>

        {/* Dnevni trend graf (jednostavan tekstualni prikaz) */}
        <div style={{
          background: '#1f2937',
          border: '2px solid #374151',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            color: '#ffffff',
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <BarChart3 size={20} style={{ color: '#f59e0b' }} />
            Dnevni trend izdavanja (30 dana)
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {dashboardData.dailyTrend && dashboardData.dailyTrend.length > 0 ? (
              <>
                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>
                    Prosečno dnevno: {dashboardData.avgDailyAssignments} izdavanja
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {dashboardData.dailyTrend.slice(0, 10).map((day, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.25rem 0',
                      fontSize: '0.85rem'
                    }}>
                      <span style={{ color: '#d1d5db' }}>
                        {new Date(day.day).toLocaleDateString('sr-RS')}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: `${Math.max(day.count * 10, 10)}px`,
                          height: '8px',
                          background: '#f59e0b',
                          borderRadius: '4px'
                        }}></div>
                        <span style={{ color: '#ffffff', fontWeight: '500', minWidth: '30px' }}>
                          {day.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {databaseInfo.dailyTrend.length > 10 && (
                  <p style={{ color: '#6b7280', fontSize: '0.8rem', textAlign: 'center', marginTop: '1rem' }}>
                    ... i još {databaseInfo.dailyTrend.length - 10} dana
                  </p>
                )}
              </>
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>
                Nema podataka za trend
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sistemske informacije */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Informacije o bazi */}
        <div style={{
          background: '#1f2937',
          border: '2px solid #374151',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            color: '#ffffff',
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Database size={20} style={{ color: '#3b82f6' }} />
            Informacije o bazi podataka
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#d1d5db' }}>Veličina baze:</span>
              <span style={{ color: '#ffffff', fontWeight: '500' }}>
                {databaseInfo ? formatBytes(databaseInfo.databaseSize) : '...'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#d1d5db' }}>Broj materijala:</span>
              <span style={{ color: '#ffffff', fontWeight: '500' }}>
                {dashboardData.totalMaterials}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#d1d5db' }}>Broj zaposlenih:</span>
              <span style={{ color: '#ffffff', fontWeight: '500' }}>
                {dashboardData.totalEmployees}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#d1d5db' }}>Status:</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {databaseInfo ? getStatusIcon(databaseInfo.status) : <Clock size={16} style={{ color: '#6b7280' }} />}
                <span style={{
                  marginLeft: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: databaseInfo ? getStatusColor(databaseInfo.status) : '#6b7280'
                }}>
                  {databaseInfo?.status || 'Učitavanje...'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#d1d5db' }}>Poslednje ažuriranje:</span>
              <span style={{ color: '#ffffff', fontWeight: '500' }}>
                {databaseInfo?.lastUpdated ? formatDate(databaseInfo.lastUpdated) : '...'}
              </span>
            </div>
          </div>
        </div>

        {/* Monitoring i trendovi */}
        <div style={{
          background: '#1f2937',
          border: '2px solid #374151',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            color: '#ffffff',
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <BarChart3 size={20} style={{ color: '#059669' }} />
            Monitoring i trendovi
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#d1d5db' }}>Trend rasta:</span>
              <span style={{ color: '#ffffff', fontWeight: '500' }}>
                {databaseInfo?.growthTrend ? `${databaseInfo.growthTrend} MB/mesec` : '...'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#d1d5db' }}>Predviđena veličina (1 god):</span>
              <span style={{ color: '#ffffff', fontWeight: '500' }}>
                {databaseInfo?.projectedSize ? formatBytes(databaseInfo.projectedSize) : '...'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#d1d5db' }}>Automatsko čišćenje:</span>
              <span style={{ color: '#ffffff', fontWeight: '500' }}>
                {databaseInfo?.autoCleanupEnabled ? 'Aktivno' : 'Neaktivno'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#d1d5db' }}>Poslednje čišćenje:</span>
              <span style={{ color: '#ffffff', fontWeight: '500' }}>
                {databaseInfo?.lastCleanup ? formatDate(databaseInfo.lastCleanup) : 'Nikad'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Akcije održavanja */}
      <div style={{
        background: '#1f2937',
        border: '2px solid #374151',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          color: '#ffffff',
          fontSize: '1.1rem',
          fontWeight: '600',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Trash2 size={20} style={{ color: '#dc2626' }} />
          Akcije održavanja
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            onClick={() => confirmDestructiveAction(
              handleCleanup,
              'Da li ste sigurni da želite da pokrenete čišćenje baze podataka? Ova akcija će obrisati stare podatke (starije od 2 godine) i nije moguće poništiti je.'
            )}
            disabled={isLoading}
            style={{
              background: isLoading ? '#6b7280' : '#dc2626',
              border: `2px solid ${isLoading ? '#4b5563' : '#b91c1c'}`,
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              <Trash2 size={16} />
            )}
            Pokreni čišćenje baze
          </button>

          <button
            onClick={() => confirmDestructiveAction(
              handleRebuildCache,
              'Da li ste sigurni da želite da pokrenete rebuild keša i re-sync zaliha? Ova operacija može potrajati nekoliko minuta.'
            )}
            disabled={isLoading}
            style={{
              background: isLoading ? '#6b7280' : '#7c3aed',
              border: `2px solid ${isLoading ? '#4b5563' : '#6d28d9'}`,
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              <RefreshCw size={16} />
            )}
            Rebuild keša / Re-sync zaliha
          </button>

          <button
            onClick={loadDatabaseInfo}
            disabled={isLoading}
            style={{
              background: isLoading ? '#6b7280' : '#374151',
              border: `2px solid ${isLoading ? '#4b5563' : '#4b5563'}`,
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Database size={16} />
            Osveži informacije
          </button>
        </div>
        
        <div style={{
          background: '#1e40af',
          color: '#dbeafe',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>ℹ️ O automatskom čišćenju</h4>
          <p>
            Sistem automatski čisti stare podatke i održava veličinu baze podataka. 
            Čišćenje se pokreće svakodnevno i briše zaduzivanja starija od 2 godine.
          </p>
        </div>
      </div>

      {/* Status i upozorenja */}
      {databaseInfo?.warnings && databaseInfo.warnings.length > 0 && (
        <div style={{
          background: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            color: '#92400e',
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
            Upozorenja i preporuke
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {databaseInfo.warnings.map((warning, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start' }}>
                <AlertTriangle size={16} style={{ color: '#f59e0b', marginTop: '0.125rem', marginRight: '0.5rem', flexShrink: 0 }} />
                <span style={{ color: '#92400e' }}>{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Podešavanja */}
      <div style={{
        background: '#1f2937',
        border: '2px solid #374151',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          color: '#ffffff',
          fontSize: '1.1rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Settings size={20} style={{ color: '#3b82f6' }} />
          Podešavanja aplikacije
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Export podešavanja */}
          <div style={{
            background: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <h4 style={{
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FileDown size={16} style={{ color: '#10b981' }} />
              Export podešavanja
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                  Podrazumevani direktorijum:
                </label>
                <input
                  type="text"
                  value={settings.exportDirectory}
                  onChange={(e) => setSettings({...settings, exportDirectory: e.target.value})}
                  placeholder="C:\Exports"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #4b5563',
                    background: '#1f2937',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
              <div>
                <label style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                  Podrazumevani šablon:
                </label>
                <select
                  value={settings.defaultTemplate}
                  onChange={(e) => setSettings({...settings, defaultTemplate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #4b5563',
                    background: '#1f2937',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="excel">Excel</option>
                  <option value="word">Word</option>
                </select>
              </div>
            </div>
          </div>

          {/* Log podešavanja */}
          <div style={{
            background: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <h4 style={{
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Shield size={16} style={{ color: '#f59e0b' }} />
              Log nivo
            </h4>
            <div>
              <label style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                Nivo logovanja:
              </label>
              <select
                value={settings.logLevel}
                onChange={(e) => setSettings({...settings, logLevel: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #4b5563',
                  background: '#1f2937',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              >
                <option value="ERROR">ERROR</option>
                <option value="WARN">WARN</option>
                <option value="INFO">INFO</option>
                <option value="DEBUG">DEBUG</option>
              </select>
            </div>
          </div>

          {/* Tema */}
          <div style={{
            background: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <h4 style={{
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Palette size={16} style={{ color: '#7c3aed' }} />
              Tema
            </h4>
            <div>
              <label style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                Izaberi temu:
              </label>
              <select
                value={settings.theme || 'dark'}
                onChange={(e) => setSettings({...settings, theme: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #4b5563',
                  background: '#1f2937',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              >
                <option value="dark">Tamna</option>
                <option value="light">Svetla</option>
                <option value="auto">Automatska</option>
              </select>
            </div>
          </div>

          {/* Magacin podešavanja */}
          <div style={{
            background: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <h4 style={{
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <HardDrive size={16} style={{ color: '#10b981' }} />
              Magacin
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                  Podrazumevani magacin:
                </label>
                <select
                  value={settings.warehouse || defaultParams.warehouse}
                  onChange={(e) => setSettings({...settings, warehouse: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #4b5563',
                    background: '#1f2937',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="main">Glavni magacin</option>
                  <option value="secondary">Pomoćni magacin</option>
                  <option value="archive">Arhivski magacin</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                  Jedinica mere:
                </label>
                <select
                  value={settings.unit || defaultParams.unit}
                  onChange={(e) => setSettings({...settings, unit: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #4b5563',
                    background: '#1f2937',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="kom">Komad</option>
                  <option value="kg">Kilogram</option>
                  <option value="l">Litar</option>
                  <option value="m">Metar</option>
                  <option value="pak">Pakovanje</option>
                </select>
              </div>
            </div>
          </div>

          {/* Finansije */}
          <div style={{
            background: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <h4 style={{
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Database size={16} style={{ color: '#f59e0b' }} />
              Finansije
            </h4>
            <div>
              <label style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                Valuta:
              </label>
              <select
                value={settings.currency || defaultParams.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #4b5563',
                  background: '#1f2937',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              >
                <option value="RSD">RSD - Srpski dinar</option>
                <option value="EUR">EUR - Evro</option>
                <option value="USD">USD - Američki dolar</option>
              </select>
            </div>
          </div>

          {/* Uloge i dozvole */}
          <div style={{
            background: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <h4 style={{
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Shield size={16} style={{ color: '#dc2626' }} />
              Uloge i dozvole
            </h4>
            <div>
              <label style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                Trenutna uloga:
              </label>
              <select
                value={settings.currentRole || 'admin'}
                onChange={(e) => setSettings({...settings, currentRole: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #4b5563',
                  background: '#1f2937',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              >
                {(defaultParams.roles || ['admin', 'magacioner', 'korisnik']).map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#9ca3af' }}>
                Dozvole: {(defaultParams.permissions?.[settings.currentRole || 'admin'] || ['read']).join(', ')}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={saveSettings}
          style={{
            background: '#059669',
            border: '2px solid #047857',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Settings size={16} />
          Sačuvaj podešavanja
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1f2937',
            border: '2px solid #374151',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            margin: '1rem'
          }}>
            <h3 style={{
              color: '#ffffff',
              fontSize: '1.2rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={24} style={{ color: '#f59e0b' }} />
              Potvrda akcije
            </h3>
            
            <p style={{
              color: '#d1d5db',
              fontSize: '1rem',
              lineHeight: '1.5',
              marginBottom: '2rem'
            }}>
              {confirmMessage}
            </p>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  background: '#374151',
                  border: '2px solid #4b5563',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Otkaži
              </button>
              
              <button
                onClick={executeConfirmedAction}
                style={{
                  background: '#dc2626',
                  border: '2px solid #b91c1c',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Potvrdi
              </button>
            </div>
          </div>
        </div>
      )}

        </div>
      )}

      {/* Employees tab */}
      {activeAdminTab === 'employees' && (
        <EmployeeManagement />
      )}
    </div>
  );
};

export default AdminPanel;
