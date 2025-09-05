import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Package,
  User,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { materialsAPI, employeesAPI } from '../services/api';
import eventBus, { EVENTS } from '../services/eventBus';

const AssignmentsOverview = () => {
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    console.log('🔄 AssignmentsOverview: Loading data...');
    setIsLoading(true);
    setError(null);
    
    try {
      const [materialsData, employeesData, assignmentsData] = await Promise.all([
        materialsAPI.getAll(),
        employeesAPI.getAll(),
        materialsAPI.getAssignments()
      ]);
      
      console.log('🔄 AssignmentsOverview: Data loaded:', { materialsData, employeesData, assignmentsData });
      
      setMaterials(materialsData);
      setEmployees(employeesData);
      setAssignments(assignmentsData);
      setFilteredAssignments(assignmentsData);
    } catch (error) {
      console.error('Greška pri učitavanju podataka:', error);
      // Umesto greške, koristimo prazne nizove
      setMaterials([]);
      setEmployees([]);
      setAssignments([]);
      setFilteredAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Slušaj evente za real-time ažuriranje
    const unsubscribeAssignmentCreated = eventBus.on(EVENTS.ASSIGNMENT_CREATED, (data) => {
      console.log('🔄 AssignmentsOverview: Assignment created event received:', data);
      loadData();
    });

    const unsubscribeAssignmentUpdated = eventBus.on(EVENTS.ASSIGNMENT_UPDATED, (data) => {
      console.log('🔄 AssignmentsOverview: Assignment updated event received:', data);
      loadData();
    });

    const unsubscribeAssignmentDeleted = eventBus.on(EVENTS.ASSIGNMENT_DELETED, (data) => {
      console.log('🔄 AssignmentsOverview: Assignment deleted event received:', data);
      loadData();
    });

    return () => {
      unsubscribeAssignmentCreated();
      unsubscribeAssignmentUpdated();
      unsubscribeAssignmentDeleted();
    };
  }, []);

  useEffect(() => {
    let filtered = assignments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(assignment => {
        const material = materials.find(m => m.id === assignment.materialId);
        const employee = employees.find(e => e.id === assignment.employeeId);
        return (
          material?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Employee filter
    if (employeeFilter) {
      filtered = filtered.filter(assignment => assignment.employeeId === parseInt(employeeFilter));
    }

    // Material filter
    if (materialFilter) {
      filtered = filtered.filter(assignment => assignment.materialId === parseInt(materialFilter));
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(assignment => {
        const assignmentDate = new Date(assignment.date);
        return assignmentDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredAssignments(filtered);
  }, [assignments, materials, employees, searchTerm, employeeFilter, materialFilter, dateFilter]);

  const getMaterialName = (materialId) => {
    const material = materials.find(m => m.id === materialId);
    return material?.name || 'Nepoznat materijal';
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Nepoznat zaposleni';
  };

  const getEmployeeDepartment = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.department || 'Nepoznato odeljenje';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('sr-RS', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTodayAssignments = () => {
    const today = new Date().toDateString();
    return assignments.filter(assignment => 
      new Date(assignment.date).toDateString() === today
    );
  };

  const getThisWeekAssignments = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    
    return assignments.filter(assignment => {
      const assignmentDate = new Date(assignment.date);
      return assignmentDate >= startOfWeek && assignmentDate <= endOfWeek;
    });
  };

  // Uklonjen error handling - koristimo prazne nizove umesto greške

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
            📋 Pregled Zaduženja
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
            Ukupno: {assignments.length} zaduženja • Prikazano: {filteredAssignments.length}
          </p>
        </div>
        <button
          onClick={loadData}
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
          {isLoading ? 'Učitavam...' : 'Osveži'}
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem',
        background: '#374151',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: '600' }}>
            {assignments.length}
          </div>
          <div style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Ukupno</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '600' }}>
            {getTodayAssignments().length}
          </div>
          <div style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Danas</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: '600' }}>
            {getThisWeekAssignments().length}
          </div>
          <div style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Ova nedelja</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#7c3aed', fontSize: '1.5rem', fontWeight: '600' }}>
            {employees.length}
          </div>
          <div style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Zaposleni</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem',
        background: '#374151',
        borderRadius: '8px'
      }}>
        <div>
          <label style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
            🔍 Pretraži
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Materijal, zaposleni..."
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
          <label style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
            👤 Zaposleni
          </label>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
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
            <option value="">Svi zaposleni</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>{employee.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
            📦 Materijal
          </label>
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
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
            <option value="">Svi materijali</option>
            {materials.map(material => (
              <option key={material.id} value={material.id}>{material.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
            📅 Datum
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
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
      </div>

      {/* Assignments List */}
      <div style={{
        maxHeight: '500px',
        overflowY: 'auto',
        border: '1px solid #374151',
        borderRadius: '8px'
      }}>
        {filteredAssignments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredAssignments.map((assignment, index) => (
              <div key={assignment.id} style={{
                padding: '1rem',
                borderBottom: index < filteredAssignments.length - 1 ? '1px solid #374151' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: index % 2 === 0 ? '#1f2937' : '#111827'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Package size={16} style={{ color: '#3b82f6' }} />
                    <span style={{ color: '#ffffff', fontWeight: '500', fontSize: '1rem' }}>
                      {getMaterialName(assignment.materialId)}
                    </span>
                    <span style={{
                      background: '#3b82f6',
                      color: '#ffffff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {assignment.quantity} kom
                    </span>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                    <User size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    {getEmployeeName(assignment.employeeId)} ({getEmployeeDepartment(assignment.employeeId)})
                  </div>
                  {assignment.notes && (
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {assignment.notes}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: '500' }}>
                    {formatDate(assignment.date)}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                    {formatTime(assignment.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            {searchTerm || employeeFilter || materialFilter || dateFilter ? 'Nema rezultata za odabrane filtere' : 'Nema zaduženja'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsOverview;
