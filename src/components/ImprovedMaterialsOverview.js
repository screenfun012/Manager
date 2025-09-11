import React, { useState, useMemo } from 'react';
import { User, Package, Calendar, Edit, Trash2, Save, X, AlertTriangle, Loader2 } from 'lucide-react';
import EditMaterialForm from './EditMaterialForm';

const ImprovedMaterialsOverview = ({ materials, dates, onQuantityChange, getTotalForCategory, getTotalForDate, onEditMaterial, onDeleteMaterial, searchTerm = '' }) => {
  const [selectedDate, setSelectedDate] = useState('all');
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  // Modal state je uklonjen - koristi se samo modal iz App.js
  // viewMode uklonjen - koristi se samo kartice

  // Tooltip i modal za detalje zaduženja
  const [tooltipData, setTooltipData] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  // Modal za editovanje količine
  const [showEditQuantityModal, setShowEditQuantityModal] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [editedQuantities, setEditedQuantities] = useState(new Set());

  // Grupišemo materijale po radniku
  const groupedByEmployee = materials.reduce((acc, material) => {
    const employeeKey = material.employeeId; // Koristimo samo employeeId

    if (!acc[employeeKey]) {
      acc[employeeKey] = {
        assignedTo: material.assignedTo,
        department: material.department,
        employeeId: material.employeeId,
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

    // Search filter - pretražuje radnike i materijale
    if (searchTerm) {
      filtered = filtered.map(employee => {
        // Filtriramo materijale unutar svakog radnika
        const filteredMaterials = Object.fromEntries(
          Object.entries(employee.materials).filter(([_, material]) => 
            material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );

        return {
          ...employee,
          materials: filteredMaterials
        };
      }).filter(employee => 
        // Zadržavamo radnika ako se pretraga poklapa sa radnikom ili ako ima materijale koji se poklapaju
        employee.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.keys(employee.materials).length > 0
      );
    }

    return filtered;
  }, [groupedByEmployee, searchTerm]);


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
    // Direktno pozivam onDeleteMaterial - modal se prikazuje u App.js
    if (onDeleteMaterial) {
      onDeleteMaterial(material.id);
    }
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
    setEditingMaterial(null);
  };

  // Tooltip i modal funkcije za detalje zaduženja
  const handleCellHover = (material, date, currentValue, event) => {
    if (currentValue > 0) {
      const rect = event.target.getBoundingClientRect();
      setTooltipData({
        material,
        date,
        quantity: currentValue,
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    } else {
      setTooltipData(null);
    }
  };

  const handleCellLeave = () => {
    setTooltipData(null);
  };

  const handleCellClickForDetails = async (materialId, date, currentValue) => {
    if (currentValue > 0) {
      // Tražimo materijal u grupi po employeeId
      const material = materials.find(m => m.id === materialId);
      if (material) {
        setSelectedAssignment({
          material,
          date,
          quantity: currentValue
        });
        setShowAssignmentModal(true);
      }
    }
  };

  const closeAssignmentModal = () => {
    setShowAssignmentModal(false);
    setSelectedAssignment(null);
  };

  // Funkcije za editovanje količine
  const handleEditQuantity = (material, date, currentValue) => {
    setEditingQuantity({
      material,
      date,
      currentValue
    });
    setNewQuantity(currentValue.toString());
    setShowEditQuantityModal(true);
  };

  const handleSaveQuantity = () => {
    if (editingQuantity && newQuantity !== '') {
      const newQty = parseInt(newQuantity);
      if (newQty >= 0) {
        // Pozovi onQuantityChange da ažurira količinu
        onQuantityChange(editingQuantity.material.id, editingQuantity.date, newQty);
        
        // Označi kao editovanu
        const editKey = `${editingQuantity.material.id}_${editingQuantity.date}`;
        setEditedQuantities(prev => new Set([...prev, editKey]));
        
        // Zatvori modal
        setShowEditQuantityModal(false);
        setEditingQuantity(null);
        setNewQuantity('');
      }
    }
  };

  const handleCancelEditQuantity = () => {
    setShowEditQuantityModal(false);
    setEditingQuantity(null);
    setNewQuantity('');
  };

  const isQuantityEdited = (materialId, date) => {
    const editKey = `${materialId}_${date}`;
    return editedQuantities.has(editKey);
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
        className={`materials-quantity-value ${currentValue === 0 ? 'empty' : 'filled'}`}
        onClick={() => handleCellClick(material.id, date, currentValue)}
        style={{
          backgroundColor: currentValue > 0 ? '#10b981' : 'transparent',
          color: currentValue > 0 ? '#ffffff' : '#9ca3af',
          border: currentValue > 0 ? '1px solid #059669' : '1px solid #4b5563'
        }}
      >
        {currentValue > 0 ? currentValue : ''}
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
                    {dates.map(date => {
                      const currentValue = material.quantities[date] || 0;
                      const isEdited = isQuantityEdited(material.id, date);
                      const hasValue = currentValue > 0;
                      
                      // Određujemo boju na osnovu stanja
                      let backgroundColor = 'transparent';
                      let textColor = '#9ca3af';
                      let borderColor = '#4b5563';
                      
                      if (hasValue) {
                        if (isEdited) {
                          // Narandžasto-žuta za editovane
                          backgroundColor = '#f59e0b';
                          textColor = '#ffffff';
                          borderColor = '#d97706';
                        } else {
                          // Zelena za originalne
                          backgroundColor = '#10b981';
                          textColor = '#ffffff';
                          borderColor = '#059669';
                        }
                      }
                      
                      return (
                        <div
                          key={date}
                          className="materials-quantity-item"
                          style={{
                            backgroundColor,
                            color: textColor,
                            border: `1px solid ${borderColor}`,
                            borderRadius: '6px',
                            padding: '0.5rem',
                            textAlign: 'center',
                            cursor: hasValue ? 'pointer' : 'default',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => handleCellHover(material, date, currentValue, e)}
                          onMouseLeave={handleCellLeave}
                          onClick={() => hasValue && handleEditQuantity(material, date, currentValue)}
                        >
                          {date}
                        </div>
                      );
                    })}
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
          {/* Search uklonjen - koristi se search iz App.js */}
        </div>

        {/* Stats */}
        <div className="materials-overview-stats">
          <span>Radnici: <strong style={{ color: '#ffffff' }}>{filteredEmployees.length}</strong></span>
          <span>Materijali: <strong style={{ color: '#ffffff' }}>{materials.length}</strong></span>
        </div>
      </div>

      {/* Content */}
      <div className="materials-overview-content">
        {renderCardView()}
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

      {/* Tooltip za detalje zaduženja */}
      {tooltipData && (
        <div
          className="assignment-tooltip"
          style={{
            position: 'fixed',
            left: tooltipData.x,
            top: tooltipData.y,
            transform: 'translateX(-50%)',
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '0.75rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            minWidth: '200px',
            pointerEvents: 'none'
          }}
        >
          <div style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            📅 {tooltipData.date}
          </div>
          <div style={{ color: '#10b981', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            📦 {tooltipData.material.name}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
            👤 {tooltipData.material.assignedTo}
          </div>
          <div style={{ color: '#60a5fa', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            🔢 Količina: {tooltipData.quantity}
            {isQuantityEdited(tooltipData.material.id, tooltipData.date) && (
              <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>
                ✏️ (editovano)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Modal za detalje zaduženja */}
      {showAssignmentModal && selectedAssignment && (
        <div
          className="assignment-modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={closeAssignmentModal}
        >
          <div
            className="assignment-modal"
            style={{
              background: '#1f2937',
              borderRadius: '12px',
              padding: '1.5rem',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
              border: '1px solid #374151'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '700' }}>
                📋 Detalji zaduženja
              </h3>
              <button
                onClick={closeAssignmentModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ color: '#60a5fa', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                📅 Datum: <strong>{selectedAssignment.date}</strong>
              </div>
              <div style={{ color: '#10b981', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                📦 Materijal: <strong>{selectedAssignment.material.name}</strong>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                👤 Zaposleni: <strong>{selectedAssignment.material.assignedTo}</strong>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                🏢 Odeljenje: <strong>{selectedAssignment.material.department}</strong>
              </div>
              <div style={{ color: '#f59e0b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                🔢 Količina: <strong>{selectedAssignment.quantity}</strong>
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                📝 Kategorija: {selectedAssignment.material.category}
              </div>
              {selectedAssignment.material.description && (
                <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  💬 Opis: {selectedAssignment.material.description}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={closeAssignmentModal}
                style={{
                  background: '#374151',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal za editovanje količine */}
      {showEditQuantityModal && editingQuantity && (
        <div
          className="edit-quantity-modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={handleCancelEditQuantity}
        >
          <div
            className="edit-quantity-modal"
            style={{
              background: '#1f2937',
              borderRadius: '12px',
              padding: '1.5rem',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
              border: '1px solid #374151'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '700' }}>
                ✏️ Izmeni količinu
              </h3>
              <button
                onClick={handleCancelEditQuantity}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ color: '#60a5fa', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                📅 Datum: <strong>{editingQuantity.date}</strong>
              </div>
              <div style={{ color: '#10b981', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                📦 Materijal: <strong>{editingQuantity.material.name}</strong>
              </div>
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>
                👤 Zaposleni: <strong>{editingQuantity.material.assignedTo}</strong>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                  Trenutna količina: <strong style={{ color: '#f59e0b' }}>{editingQuantity.currentValue}</strong>
                </label>
                <input
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  placeholder="Unesite novu količinu"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #4b5563',
                    background: '#374151',
                    color: '#ffffff',
                    fontSize: '1rem'
                  }}
                  autoFocus
                />
                <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  💡 Unesite 0 da uklonite zaduženje ili veću vrednost da povećate
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={handleCancelEditQuantity}
                style={{
                  background: '#374151',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Otkaži
              </button>
              <button
                onClick={handleSaveQuantity}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Sačuvaj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal je uklonjen - koristi se samo modal iz App.js */}
    </div>
  );
};

export default ImprovedMaterialsOverview;
