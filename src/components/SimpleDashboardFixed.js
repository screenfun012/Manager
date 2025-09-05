import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Clock, 
  BarChart3, 
  Calendar, 
  AlertTriangle, 
  Package,
  Users,
  RefreshCw
} from 'lucide-react';

const SimpleDashboardFixed = ({ currentPeriod }) => {
  const [stats, setStats] = useState({
    totalAssignments: 0,
    assignmentsToday: 0,
    assignmentsThisMonth: 0,
    newAssignments7Days: 0,
    totalMaterials: 0,
    totalEmployees: 0,
    lowStockCount: 0,
    lastUpdated: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    console.log('🔄 SimpleDashboardFixed: Loading stats...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Simuliraj podatke za sada
      const mockStats = {
        totalAssignments: 4,
        assignmentsToday: 1,
        assignmentsThisMonth: 3,
        newAssignments7Days: 2,
        totalMaterials: 15,
        totalEmployees: 8,
        lowStockCount: 2,
        lastUpdated: new Date().toLocaleTimeString()
      };
      
      console.log('🔄 SimpleDashboardFixed: Setting mock stats:', mockStats);
      setStats(mockStats);
    } catch (error) {
      console.error('Greška pri učitavanju statistika:', error);
      setError(error.message || 'Greška pri učitavanju podataka');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, gradient }) => (
    <div style={{
      background: gradient,
      padding: '1.5rem',
      borderRadius: '12px',
      textAlign: 'center',
      border: '1px solid #374151',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s ease-in-out',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
    >
      <Icon size={32} style={{ color: '#ffffff', marginBottom: '0.5rem' }} />
      <p style={{ color: '#d1d5db', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>{title}</p>
      <p style={{ color: '#ffffff', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
        {isLoading ? '...' : value}
      </p>
    </div>
  );

  if (error) {
    return (
      <div style={{
        background: '#1f2937',
        border: '1px solid #374151',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
          ❌ Greška
        </h2>
        <p style={{ color: '#d1d5db', marginBottom: '1rem' }}>{error}</p>
        <button
          onClick={loadStats}
          style={{
            background: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            color: '#d1d5db',
            cursor: 'pointer'
          }}
        >
          Pokušaj ponovo
        </button>
      </div>
    );
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
        <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
          📊 Dashboard
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
              Real-time
            </span>
          </div>
          <button
            onClick={loadStats}
            disabled={isLoading}
            style={{
              background: isLoading ? '#6b7280' : '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              padding: '0.5rem',
              color: '#d1d5db',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            <RefreshCw size={16} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            {isLoading ? 'Učitavam...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          icon={Database}
          title="Ukupno izdavanja"
          value={stats.totalAssignments}
          gradient="linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)"
        />
        <StatCard
          icon={Clock}
          title="Danas"
          value={stats.assignmentsToday}
          gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)"
        />
        <StatCard
          icon={BarChart3}
          title="Poslednjih 7 dana"
          value={stats.newAssignments7Days}
          gradient="linear-gradient(135deg, #d97706 0%, #f59e0b 100%)"
        />
        <StatCard
          icon={Calendar}
          title="Tekući mesec"
          value={stats.assignmentsThisMonth}
          gradient="linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)"
        />
        <StatCard
          icon={AlertTriangle}
          title="Niske zalihe"
          value={stats.lowStockCount}
          gradient="linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
        />
        <StatCard
          icon={Package}
          title="Ukupno materijala"
          value={stats.totalMaterials}
          gradient="linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
        />
        <StatCard
          icon={Users}
          title="Ukupno zaposlenih"
          value={stats.totalEmployees}
          gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)"
        />
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: '1px solid #374151'
      }}>
        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
          Poslednje ažuriranje: {stats.lastUpdated || 'N/A'}
        </span>
        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
          Status: {isLoading ? 'Učitavanje...' : 'Ažurirano'}
        </span>
      </div>
    </div>
  );
};

export default SimpleDashboardFixed;
