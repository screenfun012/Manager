import React, { useState, useMemo } from 'react';
import { Search, Filter, User, Package, Calendar, Edit, Trash2, Save, X, AlertTriangle, Loader2 } from 'lucide-react';
import EditMaterialForm from './EditMaterialForm';

const ImprovedMaterialsOverview = ({ materials, dates, onQuantityChange, getTotalForCategory, getTotalForDate, onEditMaterial, onDeleteMaterial }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Grupišemo materijale po radniku
  const groupedByEmployee = materials.reduce((acc, material) => {
    const employeeKey = `${material.assignedTo}_${material.department}`;

    if (!acc[employeeKey]) {
      acc[employeeKey] = {
        assignedTo: material.assignedTo,
        department: material.department,
        materials: {}
      };
    }

    const materialKey = `${material.name}_${material.category}`;

    if (!acc[employeeKey].materials[materialKey]) {
      acc[employeeKey].materials[materialKey] = {
        ...material,
        quantities: { ...material.quantities },
        total: material.total,
        id: material.id
      };
    } else {
      const existing = acc[employeeKey].materials[materialKey];
      Object.keys(material.quantities).forEach(date => {
        existing.quantities[date] = (existing.quantities[date] || 0) + (material.quantities[date] || 0);
      });
      existing.total += material.total;
    }

    return acc;
  }, {});

  // Filtriramo i pretražujemo podatke
  const filteredEmployees = useMemo(() => {
    let filtered = Object.values(groupedByEmployee);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(employee => 
        employee.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.map(employee => ({
        ...employee,
        materials: Object.fromEntries(
          Object.entries(employee.materials).filter(([_, material]) => 
            material.category === selectedCategory
          )
        )
      })).filter(employee => Object.keys(employee.materials).length > 0);
    }

    return filtered;
  }, [groupedByEmployee, searchTerm, selectedCategory]);

  // Dobijamo sve kategorije za filter
  const categories = useMemo(() => {
    const cats = new Set();
    materials.forEach(material => cats.add(material.category));
    return Array.from(cats).sort();
  }, [materials]);

  const handleCellClick = (materialId, date, currentValue) => {
    setEditingCell({ materialId, date });
    setEditValue(currentValue || '');
  };

  const handleSave = () => {
    if (editingCell) {
      onQuantityChange(editingCell.materialId, editingCell.date, editValue);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setShowEditForm(true);
  };

  const handleEditSave = (updatedMaterial) => {
    onEditMaterial(updatedMaterial);
    setShowEditForm(false);
    setEditingMaterial(null);
  };

  const handleDeleteMaterial = (material) => {
    setMaterialToDelete(material);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (materialToDelete && onDeleteMaterial) {
      onDeleteMaterial(materialToDelete.id);
    }
    setShowDeleteConfirm(false);
    setMaterialToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setMaterialToDelete(null);
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setEditingMaterial(null);
  };

  const renderCell = (material, date) => {
    const currentValue = material.quantities[date] || 0;
    
    if (editingCell && editingCell.materialId === material.id && editingCell.date === date) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <input
            type="number"
            className="input-cell"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            autoFocus
            style={{
              width: '60px',
              padding: '0.25rem',
              border: '1px solid #4b5563',
              borderRadius: '4px',
              background: '#1f2937',
              color: '#ffffff',
              textAlign: 'center'
            }}
          />
          <button 
            onClick={handleSave}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
          >
            <Save size={14} color="#10b981" />
          </button>
          <button 
            onClick={handleCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
          >
            <X size={14} color="#ef4444" />
          </button>
        </div>
      );
    }
    
    return (
      <div 
        className={`materials-quantity-value ${currentValue === 0 ? 'empty' : ''}`}
        onClick={() => handleCellClick(material.id, date, currentValue)}
      >
        {currentValue || '-'}
      </div>
    );
  };

  const renderCardView = () => (
    <div className="materials-cards-grid">
      {filteredEmployees.map((employee, employeeIndex) => (
        <div key={`${employee.assignedTo}_${employee.department}`} className="materials-employee-card">
          {/* Employee Header */}
          <div className="materials-employee-header">
            <div className="materials-employee-info">
              <User size={20} />
              <div>
                <h3 className="materials-employee-name">
                  {employee.assignedTo}
                </h3>
                <p className="materials-employee-department">
                  {employee.department}
                </p>
              </div>
            </div>
          </div>

          {/* Materials */}
          <div className="materials-employee-content">
            {Object.values(employee.materials).map(material => (
              <div key={material.id} className="materials-item-card">
                <div className="materials-item-header">
                  <div className="materials-item-info">
                    <div className="materials-item-title">
                      <Package size={16} color="#60a5fa" />
                      <span className="materials-item-name">{material.name}</span>
                      <span className="materials-item-category">
                        {material.category}
                      </span>
                    </div>
                    {material.description && (
                      <p className="materials-item-description">
                        {material.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="materials-item-actions">
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                      onClick={() => handleEditMaterial(material)}
                      title="Izmeni materijal"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                      onClick={() => handleDeleteMaterial(material)}
                      title="Obriši materijal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Quantities Grid */}
                <div className="materials-quantities-section">
                  <div className="materials-quantities-header">
                    <Calendar size={14} color="#9ca3af" />
                    <span>
                      Količine po datumima:
                    </span>
                  </div>
                  <div className="materials-quantities-grid">
                    {dates.map(date => (
                      <div key={date} className="materials-quantity-item">
                        <div className="materials-quantity-date">
                          {date}
                        </div>
                        {renderCell(material, date)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="materials-item-total">
                  <span className="materials-total-label">UKUPNO:</span>
                  <span className="materials-total-value">
                    {material.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: '120px' }}>Kategorija</th>
            <th style={{ width: '180px' }}>Naziv Materijala</th>
            <th style={{ width: '200px' }}>Opis</th>
            <th style={{ width: '120px' }}>Radnik</th>
            <th style={{ width: '80px' }}>Akcije</th>
            {dates.map(date => (
              <th key={date} style={{ width: '80px', textAlign: 'center' }}>{date}</th>
            ))}
            <th style={{ width: '100px', textAlign: 'center' }}>UKUPNO</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee, employeeIndex) => (
            <React.Fragment key={`${employee.assignedTo}_${employee.department}`}>
              {/* Employee Header */}
              <tr className="employee-header" style={{
                background: employeeIndex % 2 === 0 ? '#2d3748' : '#374151'
              }}>
                <td colSpan={dates.length + 6} style={{
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#ffffff',
                  borderBottom: '2px solid #dc2626'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} style={{ color: '#60a5fa' }} />
                    <span>{employee.assignedTo} ({employee.department})</span>
                  </div>
                </td>
              </tr>

              {/* Materials for this employee */}
              {Object.values(employee.materials).map(material => (
                <tr key={material.id} className="material-row">
                  <td style={{ paddingLeft: '2rem', fontWeight: '500' }}>
                    {material.category}
                  </td>
                  <td style={{ fontWeight: '500' }}>
                    {material.name}
                  </td>
                  <td style={{ 
                    maxWidth: '200px',
                    wordWrap: 'break-word',
                    fontSize: '0.9rem',
                    color: '#d1d5db'
                  }}>
                    {material.description || '-'}
                  </td>
                  <td style={{
                    color: '#60a5fa',
                    fontWeight: '600'
                  }}>
                    {employee.assignedTo}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        onClick={() => handleEditMaterial(material)}
                        title="Izmeni materijal"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteMaterial(material)}
                        title="Obriši materijal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                  {dates.map(date => (
                    <td key={date} style={{ textAlign: 'center' }}>
                      {renderCell(material, date)}
                    </td>
                  ))}
                  <td style={{ textAlign: 'center', fontWeight: '600' }}>
                    {material.total}
                  </td>
                </tr>
              ))}

              {/* Employee Total */}
              <tr className="employee-total-row" style={{
                background: employeeIndex % 2 === 0 ? '#1a202c' : '#2d3748',
                borderTop: '1px solid #4b5563'
              }}>
                <td colSpan={dates.length + 6} style={{
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  textAlign: 'right'
                }}>
                  UKUPNO ZA {employee.assignedTo.toUpperCase()}:
                </td>
                <td style={{
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  color: '#10b981'
                }}>
                  {Object.values(employee.materials).reduce((sum, material) => sum + material.total, 0)}
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="materials-overview-container">
      {/* Sticky Header */}
      <div className="materials-overview-header">
        <div className="materials-overview-controls">
          {/* Search */}
          <div className="materials-overview-search">
            <Search size={18} className="materials-overview-search-icon" />
            <input
              type="text"
              placeholder="Pretraži radnike..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="materials-overview-filters">
            <Filter size={16} color="#9ca3af" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Sve kategorije</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="materials-overview-view-toggle">
            <button
              onClick={() => setViewMode('cards')}
              className={viewMode === 'cards' ? 'active' : ''}
            >
              Kartice
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'active' : ''}
            >
              Tabela
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="materials-overview-stats">
          <span>Radnici: <strong style={{ color: '#ffffff' }}>{filteredEmployees.length}</strong></span>
          <span>Materijali: <strong style={{ color: '#ffffff' }}>{materials.length}</strong></span>
          <span>Kategorije: <strong style={{ color: '#ffffff' }}>{categories.length}</strong></span>
        </div>
      </div>

      {/* Content */}
      <div className="materials-overview-content">
        {viewMode === 'cards' ? renderCardView() : renderTableView()}
      </div>

      {/* Edit Modal */}
      {showEditForm && editingMaterial && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1f2937',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <EditMaterialForm
              material={editingMaterial}
              onSave={handleEditSave}
              onCancel={handleEditCancel}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && materialToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1f2937',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            border: '1px solid #dc2626'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <AlertTriangle size={32} color="#dc2626" />
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.25rem' }}>
                Obriši materijal
              </h3>
            </div>
            
            <p style={{ color: '#d1d5db', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Ova akcija se ne može poništiti. Da li ste sigurni da želite da obrišete materijal?
            </p>

            <div style={{ 
              background: '#374151', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              border: '1px solid #4b5563'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#ffffff' }}>Naziv:</strong> {materialToDelete.name}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#ffffff' }}>Kategorija:</strong> {materialToDelete.category}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#ffffff' }}>Radnik:</strong> {materialToDelete.assignedTo}
              </div>
              <div>
                <strong style={{ color: '#ffffff' }}>Ukupno:</strong> {materialToDelete.total} kom
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleDeleteCancel}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#6b7280',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Otkaži
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedMaterialsOverview;
