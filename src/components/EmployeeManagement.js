import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, Users, Building2, Save, X, AlertTriangle } from 'lucide-react';
import { employeesAPI } from '../services/api';
import eventBus, { EVENTS } from '../services/eventBus';

const EmployeeManagement = ({ employeesDB = [] }) => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showDepartmentDeleteConfirm, setShowDepartmentDeleteConfirm] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [newDepartment, setNewDepartment] = useState({ name: '', code: '' });
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    position: '',
    phone: ''
  });

  // Učitaj podatke
  useEffect(() => {
    loadDepartments();
  }, []);

  // Ažuriranje zaposlenih kada se employeesDB promeni
  useEffect(() => {
    console.log('🔍 EmployeeManagement: employeesDB changed:', employeesDB.length);
    setEmployees(employeesDB || []);
  }, [employeesDB]);

  const loadEmployees = async () => {
    try {
      console.log('🔍 loadEmployees pozvan, employeesDB:', employeesDB);
      setIsLoading(true);
      
      // Koristi podatke iz props-a
      setEmployees(employeesDB || []);
      console.log('🔍 Employees set u state:', employeesDB || []);
    } catch (error) {
      console.error('❌ Greška pri učitavanju zaposlenih:', error);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      // Za sada koristimo hardkodovane odeljenja, kasnije ćemo dodati API
      const defaultDepartments = [
        { id: 1, name: 'Proizvodnja', code: 'PROD' },
        { id: 2, name: 'Održavanje', code: 'ODRZ' },
        { id: 3, name: 'Kontrola kvaliteta', code: 'KK' },
        { id: 4, name: 'Magacin', code: 'MAG' },
        { id: 5, name: 'Administracija', code: 'ADM' }
      ];
      setDepartments(defaultDepartments);
    } catch (error) {
      console.error('Greška pri učitavanju odeljenja:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.department || !formData.position) {
      alert('Molimo popunite sva obavezna polja');
      return;
    }

    try {
      setIsLoading(true);
      
      if (editingEmployee) {
        // Ažuriraj postojećeg zaposlenog
        try {
          const updatedEmployee = await employeesAPI.update(editingEmployee.id, formData);
          setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? updatedEmployee : emp));
          eventBus.emit(EVENTS.EMPLOYEE_UPDATED, { employee: updatedEmployee });
        } catch (apiError) {
          console.warn('API error, updating locally:', apiError);
          // Fallback - ažuriraj lokalno
          const updatedEmployee = { ...editingEmployee, ...formData };
          setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? updatedEmployee : emp));
          eventBus.emit(EVENTS.EMPLOYEE_UPDATED, { employee: updatedEmployee });
        }
      } else {
        // Dodaj novog zaposlenog
        try {
          const newEmployee = await employeesAPI.create(formData);
          setEmployees(prev => [...prev, newEmployee]);
          eventBus.emit(EVENTS.EMPLOYEE_UPDATED, { employee: newEmployee });
        } catch (apiError) {
          console.warn('API error, adding locally:', apiError);
          // Fallback - dodaj lokalno
          const newEmployee = { 
            id: Date.now(), 
            ...formData 
          };
          setEmployees(prev => [...prev, newEmployee]);
          eventBus.emit(EVENTS.EMPLOYEE_UPDATED, { employee: newEmployee });
        }
      }

      // Resetuj formu
      setFormData({ name: '', department: '', position: '', phone: '' });
      setShowAddForm(false);
      setEditingEmployee(null);
      
    } catch (error) {
      console.error('Greška pri čuvanju zaposlenog:', error);
      alert('Greška pri čuvanju zaposlenog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name || '',
      department: employee.department || '',
      position: employee.position || '',
      phone: employee.phone || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteClick = (employee) => {
    console.log('🔍 handleDeleteClick pozvan za:', employee);
    setEmployeeToDelete(employee);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    
    console.log('🔍 handleDeleteConfirm pozvan za:', employeeToDelete);

    try {
      setIsLoading(true);
      console.log('🔍 Pokretam brisanje...');

      // Stvarno brisanje iz baze
      try {
        console.log('🔍 Pozivam employeesAPI.delete za ID:', employeeToDelete.id);
        const result = await employeesAPI.delete(employeeToDelete.id);
        console.log('✅ Zaposleni obrisan iz baze:', result);
      } catch (apiError) {
        console.error('❌ API error:', apiError);
        alert('Greška pri brisanju zaposlenog iz baze: ' + apiError.message);
        return;
      }

      // Ukloni iz lokalnog state-a
      console.log('🔍 Uklanjam iz lokalnog state-a...');
      setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete.id));
      eventBus.emit(EVENTS.EMPLOYEE_DELETED, { employee: employeeToDelete });
      console.log('✅ Zaposleni uspešno obrisan!');

    } catch (error) {
      console.error('❌ Greška pri brisanju zaposlenog:', error);
      alert('Greška pri brisanju zaposlenog: ' + error.message);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setEmployeeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);
  };

  const handleDeleteDepartmentClick = (department) => {
    const employeeCount = employees.filter(emp => emp.department === department.name).length;

    if (employeeCount > 0) {
      alert(`Ne možete obrisati odeljenje "${department.name}" jer ima ${employeeCount} zaposlenih. Prvo premestite ili arhivirajte zaposlene.`);
      return;
    }

    setDepartmentToDelete(department);
    setShowDepartmentDeleteConfirm(true);
  };

  const handleDeleteDepartmentConfirm = async () => {
    if (!departmentToDelete) return;

    try {
      setIsLoading(true);

      // Ukloni odeljenje iz liste
      setDepartments(prev => prev.filter(dept => dept.id !== departmentToDelete.id));
      eventBus.emit(EVENTS.DEPARTMENT_UPDATED, { department: departmentToDelete, action: 'deleted' });

    } catch (error) {
      console.error('Greška pri brisanju odeljenja:', error);
      alert('Greška pri brisanju odeljenja');
    } finally {
      setIsLoading(false);
      setShowDepartmentDeleteConfirm(false);
      setDepartmentToDelete(null);
    }
  };

  const handleDeleteDepartmentCancel = () => {
    setShowDepartmentDeleteConfirm(false);
    setDepartmentToDelete(null);
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    
    if (!newDepartment.name || !newDepartment.code) {
      alert('Molimo popunite sva polja za odeljenje');
      return;
    }

    // Proveri jedinstvenost šifre odeljenja
    const existingDept = departments.find(dept => dept.code === newDepartment.code);
    if (existingDept) {
      alert('Odeljenje sa ovom šifrom već postoji');
      return;
    }

    const department = {
      id: Date.now(),
      name: newDepartment.name,
      code: newDepartment.code
    };

    setDepartments(prev => [...prev, department]);
    setNewDepartment({ name: '', code: '' });
    setShowDepartmentForm(false);
    eventBus.emit(EVENTS.DEPARTMENT_UPDATED, { department });
  };

  const filteredEmployees = employees.filter(emp => 
    (emp.name && emp.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (emp.code && emp.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  console.log('Search term:', searchTerm);
  console.log('Total employees:', employees.length);
  console.log('Filtered employees:', filteredEmployees.length);

  console.log('EmployeeManagement rendering, employees:', employees.length);
  
  return (
    <div className="admin-section" style={{ background: '#1f2937', padding: '2rem', borderRadius: '12px', border: '2px solid #374151', minHeight: '400px' }}>
      <div className="admin-section-header">
        <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}><Users size={20} /> Upravljanje zaposlenima</h3>
        
        {/* Debug info */}
        <div style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '1rem' }}>
          DEBUG: Komponenta se renderuje, broj zaposlenih: {employees.length}, filtriranih: {filteredEmployees.length}, pretraga: "{searchTerm}"
        </div>
        <div className="admin-section-actions">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            <Plus size={16} /> Dodaj zaposlenog
          </button>
        </div>
      </div>

      {/* Pretraga */}
      <div className="search-container">
        <Search size={16} />
        <input
          type="text"
          placeholder="Pretraži zaposlene..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Tabela zaposlenih */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ime i prezime</th>
              <th>Pozicija</th>
              <th>Odeljenje</th>
              <th>Telefon</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map(employee => (
                <tr key={employee.id}>
                  <td>
                    <div className="employee-info">
                      <strong>{employee.name}</strong>
                    </div>
                  </td>
                  <td>{employee.position || 'N/A'}</td>
                  <td>{employee.department}</td>
                  <td>{employee.phone || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="btn btn-sm btn-secondary"
                        title="Izmeni"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(employee)}
                        className="btn btn-sm btn-danger"
                        title="Obriši"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                  {searchTerm ? `Nema rezultata za pretragu "${searchTerm}"` : 'Nema zaposlenih'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Forma za dodavanje/izmenu zaposlenog */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>{editingEmployee ? 'Izmeni zaposlenog' : 'Dodaj zaposlenog'}</h4>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingEmployee(null);
                  setFormData({ name: '', code: '', department: '', status: 'active' });
                }}
                className="btn btn-sm btn-secondary"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Ime i prezime *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Pozicija *</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  required
                  placeholder="npr. Tehničar, Radnik..."
                />
              </div>

              <div className="form-group">
                <label>Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="npr. 061-123-456"
                />
              </div>
              
              <div className="form-group">
                <label>Odeljenje *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  required
                >
                  <option value="">Izaberite odeljenje</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
              
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? 'Čuvanje...' : <Save size={16} />} {editingEmployee ? 'Ažuriraj' : 'Dodaj'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingEmployee(null);
                    setFormData({ name: '', department: '', position: '', phone: '' });
                  }}
                  className="btn btn-secondary"
                >
                  <X size={16} /> Otkaži
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upravljanje odeljenjima */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h3><Building2 size={20} /> Upravljanje odeljenjima</h3>
          <button 
            onClick={() => setShowDepartmentForm(true)}
            className="btn btn-primary"
          >
            <Plus size={16} /> Dodaj odeljenje
          </button>
        </div>

        <div className="departments-grid">
          {departments.map(dept => (
            <div key={dept.id} className="department-card">
              <div className="department-card-header">
                <h4>{dept.name}</h4>
                <button
                  onClick={() => handleDeleteDepartmentClick(dept)}
                  className="btn btn-sm btn-danger"
                  title="Obriši odeljenje"
                  style={{ marginLeft: 'auto' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p>Šifra: {dept.code}</p>
              <p className="department-stats">
                {employees.filter(emp => emp.department === dept.name).length} zaposlenih
              </p>
            </div>
          ))}
        </div>

        {/* Forma za dodavanje odeljenja */}
        {showDepartmentForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h4>Dodaj odeljenje</h4>
                <button 
                  onClick={() => {
                    setShowDepartmentForm(false);
                    setNewDepartment({ name: '', code: '' });
                  }}
                  className="btn btn-sm btn-secondary"
                >
                  <X size={16} />
                </button>
              </div>
              
              <form onSubmit={handleAddDepartment}>
                <div className="form-group">
                  <label>Naziv odeljenja *</label>
                  <input
                    type="text"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Šifra odeljenja *</label>
                  <input
                    type="text"
                    value={newDepartment.code}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, code: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} /> Dodaj odeljenje
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowDepartmentForm(false);
                      setNewDepartment({ name: '', code: '' });
                    }}
                    className="btn btn-secondary"
                  >
                    <X size={16} /> Otkaži
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal za potvrdu brisanja zaposlenog */}
      {showDeleteConfirm && employeeToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '50%',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={20} style={{ color: '#ffffff' }} />
                </div>
                <h4 style={{ color: '#ffffff', margin: 0 }}>Potvrda brisanja</h4>
              </div>
              <button 
                onClick={handleDeleteCancel}
                className="btn btn-sm btn-secondary"
                style={{ 
                  background: '#6b7280',
                  border: '1px solid #6b7280',
                  borderRadius: '8px',
                  padding: '0.5rem'
                }}
              >
                <X size={16} />
              </button>
            </div>
            
            <div style={{ padding: '1rem 0' }}>
              <p style={{ 
                marginBottom: '1.5rem', 
                color: '#d1d5db',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                Da li ste sigurni da želite da obrišete zaposlenog:
              </p>
              <div style={{ 
                background: '#374151', 
                border: '1px solid #4b5563',
                padding: '1.25rem', 
                borderRadius: '12px',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <p style={{ 
                  fontWeight: '600', 
                  margin: 0, 
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  marginBottom: '0.5rem'
                }}>
                  {employeeToDelete.name}
                </p>
                <p style={{ 
                  margin: 0, 
                  color: '#9ca3af', 
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>
                    {employeeToDelete.position}
                  </span>
                  <span>•</span>
                  <span style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>
                    {employeeToDelete.department}
                  </span>
                </p>
              </div>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <AlertTriangle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                <p style={{ 
                  color: '#ef4444', 
                  fontSize: '0.9rem', 
                  fontWeight: '500',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  Ova akcija se ne može poništiti!
                </p>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                onClick={handleDeleteConfirm}
                className="btn btn-danger"
                disabled={isLoading}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <Trash2 size={16} />
                {isLoading ? 'Brisanje...' : 'Obriši zaposlenog'}
              </button>
              <button 
                onClick={handleDeleteCancel}
                className="btn btn-secondary"
                disabled={isLoading}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: '#6b7280',
                  border: '1px solid #6b7280',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <X size={16} />
                Otkaži
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal za potvrdu brisanja odeljenja */}
      {showDepartmentDeleteConfirm && departmentToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '50%',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={20} style={{ color: '#ffffff' }} />
                </div>
                <h4 style={{ color: '#ffffff', margin: 0 }}>Potvrda brisanja odeljenja</h4>
              </div>
              <button 
                onClick={handleDeleteDepartmentCancel}
                className="btn btn-sm btn-secondary"
                style={{ 
                  background: '#6b7280',
                  border: '1px solid #6b7280',
                  borderRadius: '8px',
                  padding: '0.5rem'
                }}
              >
                <X size={16} />
              </button>
            </div>
            
            <div style={{ padding: '1rem 0' }}>
              <p style={{ 
                marginBottom: '1.5rem', 
                color: '#d1d5db',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                Da li ste sigurni da želite da obrišete odeljenje:
              </p>
              <div style={{ 
                background: '#374151', 
                border: '1px solid #4b5563',
                padding: '1.25rem', 
                borderRadius: '12px',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <p style={{ 
                  fontWeight: '600', 
                  margin: 0, 
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  marginBottom: '0.5rem'
                }}>
                  {departmentToDelete.name}
                </p>
                <p style={{ 
                  margin: 0, 
                  color: '#9ca3af', 
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>
                    Šifra: {departmentToDelete.code}
                  </span>
                  <span>•</span>
                  <span style={{
                    background: '#10b981',
                    color: '#ffffff',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>
                    {employees.filter(emp => emp.department === departmentToDelete.name).length} zaposlenih
                  </span>
                </p>
              </div>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <AlertTriangle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                <p style={{ 
                  color: '#ef4444', 
                  fontSize: '0.9rem', 
                  fontWeight: '500',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  Ova akcija se ne može poništiti!
                </p>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                onClick={handleDeleteDepartmentConfirm}
                className="btn btn-danger"
                disabled={isLoading}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <Trash2 size={16} />
                {isLoading ? 'Brisanje...' : 'Obriši odeljenje'}
              </button>
              <button 
                onClick={handleDeleteDepartmentCancel}
                className="btn btn-secondary"
                disabled={isLoading}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: '#6b7280',
                  border: '1px solid #6b7280',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <X size={16} />
                Otkaži
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
