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
import { getDatabaseInfo } from '../services/api';
import eventBus, { EVENTS } from '../services/eventBus';

const SimpleDashboard = ({ currentPeriod }) => {
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
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailData, setDetailData] = useState(null);

  const loadStats = async () => {
    console.log('🔄 SimpleDashboard: Loading stats...');
    setIsLoading(true);
    setError(null);
    try {
      // Osiguraj da currentPeriod postoji
      const period = currentPeriod || { from: new Date(), to: new Date() };
      console.log('🔄 SimpleDashboard: Using period:', period);
      
      const info = await getDatabaseInfo(period);
      console.log('🔄 SimpleDashboard: Stats loaded:', info);
      
      const newStats = {
        totalAssignments: info?.totalAssignments || 0,
        assignmentsToday: info?.assignmentsToday || 0,
        assignmentsThisMonth: info?.assignmentsThisMonth || 0,
        newAssignments7Days: info?.newAssignments7Days || 0,
        totalMaterials: info?.totalMaterials || 0,
        totalEmployees: info?.totalEmployees || 0,
        lowStockCount: info?.lowStockCount || 0,
        lastUpdated: new Date().toLocaleTimeString()
      };
      
      console.log('🔄 SimpleDashboard: Setting new stats:', newStats);
      setStats(newStats);
      
      // Sačuvaj detaljne podatke
      setDetailData({
        topMaterials: info?.topMaterials || [],
        lowStockMaterials: info?.lowStockMaterials || [],
        assignmentsByUser: info?.assignmentsByUser || [],
        assignmentsByDepartment: info?.assignmentsByDepartment || [],
        dailyTrend: info?.dailyTrend || []
      });
    } catch (error) {
      console.error('Greška pri učitavanju statistika:', error);
      setError(error.message || 'Greška pri učitavanju podataka');
    } finally {
      setIsLoading(false);
    }
  };

  const showDetail = (type) => {
    setSelectedDetail(type);
  };

  const closeDetail = () => {
    setSelectedDetail(null);
  };

  useEffect(() => {
    loadStats();
  }, [currentPeriod]);

  useEffect(() => {
    // Slušaj evente za real-time ažuriranje
    const unsubscribeDataSync = eventBus.on(EVENTS.DATA_SYNC_NEEDED, (data) => {
      console.log('🔄 SimpleDashboard: Data sync event received:', data);
      console.log('🔄 SimpleDashboard: Calling loadStats in 500ms...');
      setTimeout(() => {
        console.log('🔄 SimpleDashboard: Executing loadStats...');
        loadStats();
      }, 500);
    });

    const unsubscribeAssignmentCreated = eventBus.on(EVENTS.ASSIGNMENT_CREATED, (data) => {
      console.log('🔄 SimpleDashboard: Assignment created event received:', data);
      console.log('🔄 SimpleDashboard: Calling loadStats in 500ms...');
      setTimeout(() => {
        console.log('🔄 SimpleDashboard: Executing loadStats...');
        loadStats();
      }, 500);
    });

    const unsubscribeMaterialCreated = eventBus.on(EVENTS.MATERIAL_CREATED, (data) => {
      console.log('🔄 SimpleDashboard: Material created event received:', data);
      setTimeout(() => loadStats(), 500);
    });

    const unsubscribeEmployeeCreated = eventBus.on(EVENTS.EMPLOYEE_CREATED, (data) => {
      console.log('🔄 SimpleDashboard: Employee created event received:', data);
      setTimeout(() => loadStats(), 500);
    });

    return () => {
      unsubscribeDataSync();
      unsubscribeAssignmentCreated();
      unsubscribeMaterialCreated();
      unsubscribeEmployeeCreated();
    };
  }, []);

  const StatCard = ({ icon: Icon, title, value, color, gradient, detailType }) => (
    <div 
      onClick={() => detailType && showDetail(detailType)}
      style={{
        background: gradient || `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        padding: '1.5rem',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #374151',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s ease-in-out',
        cursor: detailType ? 'pointer' : 'default'
      }}
      onMouseEnter={(e) => detailType && (e.target.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => detailType && (e.target.style.transform = 'translateY(0)')}
    >
      <Icon size={32} style={{ color: '#ffffff', marginBottom: '0.5rem' }} />
      <p style={{ color: '#d1d5db', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>{title}</p>
      <p style={{ color: '#ffffff', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
        {isLoading ? '...' : value}
      </p>
      {detailType && (
        <p style={{ color: '#d1d5db', fontSize: '0.8rem', margin: '0.5rem 0 0 0' }}>
          Klikni za detalje
        </p>
      )}
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
          detailType="totalAssignments"
        />
        <StatCard
          icon={Clock}
          title="Danas"
          value={stats.assignmentsToday}
          gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)"
          detailType="assignmentsToday"
        />
        <StatCard
          icon={BarChart3}
          title="Poslednjih 7 dana"
          value={stats.newAssignments7Days}
          gradient="linear-gradient(135deg, #d97706 0%, #f59e0b 100%)"
          detailType="assignments7Days"
        />
        <StatCard
          icon={Calendar}
          title="Tekući mesec"
          value={stats.assignmentsThisMonth}
          gradient="linear-gradient(135deg, #7c2d12 0%, #dc2626 100%)"
          detailType="assignmentsThisMonth"
        />
        <StatCard
          icon={AlertTriangle}
          title="Niske zalihe"
          value={stats.lowStockCount}
          gradient="linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
          detailType="lowStock"
        />
        <StatCard
          icon={Package}
          title="Ukupno materijala"
          value={stats.totalMaterials}
          gradient="linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
          detailType="materials"
        />
        <StatCard
          icon={Users}
          title="Ukupno zaposlenih"
          value={stats.totalEmployees}
          gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)"
          detailType="employees"
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

      {/* Detail Modal */}
      {selectedDetail && (
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
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
                {selectedDetail === 'totalAssignments' && '📊 Ukupno izdavanja'}
                {selectedDetail === 'assignmentsToday' && '📅 Danasšnja izdavanja'}
                {selectedDetail === 'assignments7Days' && '📈 Poslednjih 7 dana'}
                {selectedDetail === 'assignmentsThisMonth' && '📆 Tekući mesec'}
                {selectedDetail === 'lowStock' && '⚠️ Niske zalihe'}
                {selectedDetail === 'materials' && '📦 Materijali'}
                {selectedDetail === 'employees' && '👥 Zaposleni'}
              </h3>
              <button
                onClick={closeDetail}
                style={{
                  background: '#dc2626',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ color: '#d1d5db' }}>
              {selectedDetail === 'lowStock' && detailData?.lowStockMaterials && (
                <div>
                  <h4 style={{ color: '#ffffff', marginBottom: '1rem' }}>Materijali sa niskim zalihama:</h4>
                  {detailData.lowStockMaterials.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {detailData.lowStockMaterials.map((material, index) => (
                        <div key={index} style={{
                          background: '#374151',
                          padding: '1rem',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ color: '#ffffff', fontWeight: '500' }}>{material.name}</div>
                            <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                              Min: {material.minQuantity} | Trenutno: {material.quantity}
                            </div>
                          </div>
                          <div style={{
                            color: material.quantity === 0 ? '#ef4444' : '#f59e0b',
                            fontWeight: '600',
                            fontSize: '1.2rem'
                          }}>
                            {material.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#10b981', textAlign: 'center', padding: '2rem' }}>
                      ✅ Sve zalihe su na dovoljnom nivou
                    </p>
                  )}
                </div>
              )}

              {selectedDetail === 'materials' && detailData?.topMaterials && (
                <div>
                  <h4 style={{ color: '#ffffff', marginBottom: '1rem' }}>Top materijali (poslednjih 30 dana):</h4>
                  {detailData.topMaterials.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {detailData.topMaterials.slice(0, 10).map((material, index) => (
                        <div key={index} style={{
                          background: '#374151',
                          padding: '1rem',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ color: '#ffffff', fontWeight: '500' }}>
                            {index + 1}. {material.name}
                          </div>
                          <div style={{ color: '#10b981', fontWeight: '600' }}>
                            {material.count} puta
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
                      Nema podataka za poslednjih 30 dana
                    </p>
                  )}
                </div>
              )}

              {selectedDetail === 'employees' && detailData?.assignmentsByUser && (
                <div>
                  <h4 style={{ color: '#ffffff', marginBottom: '1rem' }}>Izdavanja po zaposlenima:</h4>
                  {detailData.assignmentsByUser.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {detailData.assignmentsByUser.map((user, index) => (
                        <div key={index} style={{
                          background: '#374151',
                          padding: '1rem',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ color: '#ffffff', fontWeight: '500' }}>{user.name}</div>
                            <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{user.department}</div>
                          </div>
                          <div style={{ color: '#7c3aed', fontWeight: '600' }}>
                            {user.count} izdavanja
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
                      Nema podataka za poslednjih 30 dana
                    </p>
                  )}
                </div>
              )}

              {(selectedDetail === 'totalAssignments' || selectedDetail === 'assignmentsToday' || 
                selectedDetail === 'assignments7Days' || selectedDetail === 'assignmentsThisMonth') && (
                <div>
                  <h4 style={{ color: '#ffffff', marginBottom: '1rem' }}>Detaljni pregled:</h4>
                  <div style={{
                    background: '#374151',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: '#d1d5db', marginBottom: '1rem' }}>
                      Broj: <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '1.2rem' }}>
                        {selectedDetail === 'totalAssignments' && stats.totalAssignments}
                        {selectedDetail === 'assignmentsToday' && stats.assignmentsToday}
                        {selectedDetail === 'assignments7Days' && stats.newAssignments7Days}
                        {selectedDetail === 'assignmentsThisMonth' && stats.assignmentsThisMonth}
                      </span>
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                      Poslednje ažuriranje: {stats.lastUpdated}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleDashboard;
