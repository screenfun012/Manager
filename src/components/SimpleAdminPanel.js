import React, { useState, useEffect } from 'react';
import { Database, Settings, Shield, LogOut, Package, UserCheck, Users, BarChart3 } from 'lucide-react';
import AdminLogin from './AdminLogin';
import EmployeeManagement from './EmployeeManagement';
import AdminDashboard from './AdminDashboard';
import AdminStats from './AdminStats';

const SimpleAdminPanel = ({ currentPeriod, materials = [], materialsDB = [], employeesDB = [], assignments = [], onRefresh }) => {
  console.log('🚨🚨🚨 SimpleAdminPanel COMPONENT RENDERED! 🚨🚨🚨');
  console.log('🔍 SimpleAdminPanel: activeAdminTab:', 'dashboard'); // default je dashboard

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  const [message, setMessage] = useState('');

  // Debug log za materialsDB
  console.log('🔍 SimpleAdminPanel: materialsDB length:', materialsDB.length);
  console.log('🔍 SimpleAdminPanel: materialsDB items:', materialsDB.map(m => ({ id: m.id, name: m.name, created_at: m.created_at })));

  // Dodatni debug - proveri današnje materijale
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayMaterials = materialsDB.filter(m => {
    const materialDate = new Date(m.created_at);
    return materialDate >= todayStart;
  });
  console.log('🔍 SimpleAdminPanel: Today materials count:', todayMaterials.length);
  console.log('🔍 SimpleAdminPanel: Today materials:', todayMaterials.map(m => ({ name: m.name, created_at: m.created_at })));

  const handleLogin = (success) => {
    if (success) {
      setIsAuthenticated(true);
      setMessage('Uspešno ste se ulogovali!');
      setMessageType('success');
    } else {
      setMessage('Neispravni kredencijali!');
      setMessageType('error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setActiveAdminTab('dashboard');
    setMessage('Uspešno ste se izlogovali!');
    setMessageType('success');
  };

  const [messageType, setMessageType] = useState('');

  // Check for saved credentials on component mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        // Check if the token is not expired (24 hours)
        const isExpired = Date.now() - authData.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired) {
          setIsAuthenticated(true);
          setMessage('Automatski ulogovani!');
          setMessageType('success');
        } else {
          localStorage.removeItem('adminAuth');
        }
      } catch (error) {
        console.error('Greška pri čitanju sačuvanih kredencijala:', error);
        localStorage.removeItem('adminAuth');
      }
    }
  }, []);

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div style={{
      background: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
            🛡️ Admin Panel
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
            Upravljanje aplikacijom
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: '#dc2626',
            border: '1px solid #b91c1c',
            color: '#ffffff',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <LogOut size={16} />
          Izloguj se
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => setActiveAdminTab('dashboard')}
          style={{
            background: activeAdminTab === 'dashboard' ? '#3b82f6' : '#374151',
            border: '2px solid #4b5563',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Database size={20} />
          Dashboard
        </button>
        
        <button
          onClick={() => setActiveAdminTab('stats')}
          style={{
            background: activeAdminTab === 'stats' ? '#3b82f6' : '#374151',
            border: '2px solid #4b5563',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <BarChart3 size={20} />
          Statistike
        </button>
        
        <button
          onClick={() => setActiveAdminTab('employees')}
          style={{
            background: activeAdminTab === 'employees' ? '#3b82f6' : '#374151',
            border: '2px solid #4b5563',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Users size={20} />
          Zaposleni
        </button>
        
        <button
          onClick={() => setActiveAdminTab('settings')}
          style={{
            background: activeAdminTab === 'settings' ? '#3b82f6' : '#374151',
            border: '2px solid #4b5563',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Settings size={20} />
          Podešavanja
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          background: messageType === 'success' ? '#065f46' : '#7f1d1d',
          border: `1px solid ${messageType === 'success' ? '#10b981' : '#dc2626'}`,
          color: messageType === 'success' ? '#d1fae5' : '#fecaca',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          {message}
        </div>
      )}

      {/* Content */}
      {activeAdminTab === 'dashboard' && (
        <AdminDashboard
          currentPeriod={currentPeriod}
          materials={materials}
          materialsDB={materialsDB}
          employeesDB={employeesDB}
          assignments={assignments}
          onRefresh={onRefresh}
        />
      )}

      {activeAdminTab === 'stats' && (
        <AdminStats 
          materials={materials}
          materialsDB={materialsDB}
          employeesDB={employeesDB}
          assignments={assignments}
          currentPeriod={currentPeriod}
        />
      )}

      {activeAdminTab === 'employees' && (
        <EmployeeManagement employeesDB={employeesDB} />
      )}

      {activeAdminTab === 'settings' && (
        <div style={{
          background: '#374151',
          border: '1px solid #4b5563',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Podešavanja</h3>
          <p style={{ color: '#d1d5db' }}>Podešavanja će biti dostupna uskoro...</p>
        </div>
      )}
    </div>
  );
};

export default SimpleAdminPanel;

