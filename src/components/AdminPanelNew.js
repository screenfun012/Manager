import React, { useState, useEffect } from 'react';
import { Database, Settings, Shield, LogOut } from 'lucide-react';
import AdminLogin from './AdminLogin';
import EmployeeManagement from './EmployeeManagement';
import SimpleDashboard from './SimpleDashboard';

const AdminPanel = ({ currentPeriod }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const checkAuthStatus = () => {
    const authStatus = localStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  };

  const handleLogin = (success) => {
    if (success) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      setMessage('Uspešno ste se ulogovali!');
      setMessageType('success');
    } else {
      setMessage('Pogrešni kredencijali!');
      setMessageType('error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    setMessage('Uspešno ste se odjavili!');
    setMessageType('success');
  };

  const showToast = (message, type) => {
    setMessage(message);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div style={{
      background: '#111827',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #374151'
      }}>
        <h1 style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: '600', margin: 0 }}>
          🛡️ Admin Panel
        </h1>
        <button
          onClick={handleLogout}
          style={{
            background: '#dc2626',
            border: 'none',
            color: '#ffffff',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <LogOut size={16} />
          Odjavi se
        </button>
      </div>

      {/* Navigation Tabs */}
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
          <Shield size={20} />
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
          background: messageType === 'success' ? '#10b981' : '#ef4444',
          color: '#ffffff',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      {/* Content */}
      {activeAdminTab === 'dashboard' && (
        <SimpleDashboard currentPeriod={currentPeriod} />
      )}

      {activeAdminTab === 'employees' && (
        <EmployeeManagement />
      )}

      {activeAdminTab === 'settings' && (
        <div style={{
          background: '#1f2937',
          border: '1px solid #374151',
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

export default AdminPanel;
