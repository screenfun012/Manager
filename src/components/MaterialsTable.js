import React, { useState } from 'react';
import { Save, X, Edit, User, Trash2 } from 'lucide-react';
import EditMaterialForm from './EditMaterialForm';


const MaterialsTable = ({ materials, dates, onQuantityChange, getTotalForCategory, getTotalForDate, onEditMaterial, onDeleteMaterial }) => {
  console.log('🔍 MaterialsTable render - materials prop:', materials);
  console.log('🔍 MaterialsTable render - materials length:', materials.length);
  
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

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
    const confirmed = window.confirm(`Da li ste sigurni da želite da obrišete materijal "${material.name}"?`);
    if (confirmed && onDeleteMaterial) {
      onDeleteMaterial(material.id);
    }
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
          />
          <button 
            onClick={handleSave}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
          >
            <Save size={16} color="#dc2626" />
          </button>
          <button 
            onClick={handleCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
          >
            <X size={16} color="#ef4444" />
          </button>
        </div>
      );
    }
    
    return (
      <div 
        className="input-cell"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => handleCellClick(material.id, date, currentValue)}
      >
        {currentValue || '-'}
      </div>
    );
  };

  // Grupišemo materijale po radniku (assignedTo + department)
  const groupedByEmployee = materials.reduce((acc, material) => {
    const employeeKey = `${material.assignedTo}_${material.department}`;

    if (!acc[employeeKey]) {
      acc[employeeKey] = {
        assignedTo: material.assignedTo,
        department: material.department,
        materials: {}
      };
    }

    // Unutar svakog radnika, grupišemo po nazivu materijala
    const materialKey = `${material.name}_${material.category}`;

    if (!acc[employeeKey].materials[materialKey]) {
      acc[employeeKey].materials[materialKey] = {
        ...material,
        quantities: { ...material.quantities },
        total: material.total,
        id: material.id
      };
    } else {
      // Kumuliramo količine ako isti materijal postoji više puta
      const existing = acc[employeeKey].materials[materialKey];
      Object.keys(material.quantities).forEach(date => {
        existing.quantities[date] = (existing.quantities[date] || 0) + (material.quantities[date] || 0);
      });
      existing.total += material.total;
    }

    return acc;
  }, {});

  // Pretvaramo u array za lakše mapiranje
  const employeesArray = Object.values(groupedByEmployee);

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: '120px' }}>Kategorija</th>
            <th style={{ width: '180px' }}>Naziv Materijala</th>
            <th style={{ width: '120px' }}>Radnik</th>
            <th style={{ width: '80px' }}>Akcije</th>
            {dates.map(date => (
              <th key={date} style={{ width: '80px', textAlign: 'center' }}>{date}</th>
            ))}
            <th style={{ width: '100px', textAlign: 'center' }}>UKUPNO</th>
          </tr>
        </thead>
        <tbody>
          {employeesArray.map((employee, employeeIndex) => (
            <React.Fragment key={`${employee.assignedTo}_${employee.department}`}>
              {/* Employee Header */}
              <tr className="employee-header" style={{
                background: employeeIndex % 2 === 0 ? '#2d3748' : '#374151'
              }}>
                <td colSpan={dates.length + 5} style={{
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
                <td colSpan={4} style={{
                  padding: '0.75rem 2rem',
                  fontWeight: '600',
                  color: '#fbbf24'
                }}>
                  UKUPNO ZA {employee.assignedTo}
                </td>
                {dates.map(date => (
                  <td key={date} style={{ textAlign: 'center', fontWeight: '600', color: '#fbbf24' }}>
                    {Object.values(employee.materials).reduce((sum, material) =>
                      sum + (material.quantities[date] || 0), 0
                    )}
                  </td>
                ))}
                <td style={{ textAlign: 'center', fontWeight: '700', color: '#fbbf24' }}>
                  {Object.values(employee.materials).reduce((sum, material) => sum + material.total, 0)}
                </td>
              </tr>
            </React.Fragment>
          ))}

          {/* Overall Total Row */}
          <tr className="overall-total-row">
            <td colSpan={dates.length + 5} style={{
              padding: '1rem',
              fontSize: '1.2rem',
              fontWeight: '700',
              color: '#dc2626',
              borderTop: '3px solid #dc2626',
              textAlign: 'center'
            }}>
              UKUPNO SVI MATERIJALI - AVGUST 2024
            </td>
          </tr>
          <tr className="overall-total-row">
            <td colSpan={4} style={{
              fontWeight: '700',
              color: '#ffffff'
            }}>
              UKUPNA KOLIČINA PO DANIMA:
            </td>
            {dates.map(date => (
              <td key={date} style={{ textAlign: 'center', fontWeight: '700', color: '#86efac' }}>
                {getTotalForDate(date)}
              </td>
            ))}
            <td style={{ textAlign: 'center', fontWeight: '700', color: '#86efac' }}>
              {materials.reduce((sum, material) => sum + material.total, 0)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Forma za editovanje materijala */}
      {showEditForm && editingMaterial && (
        <EditMaterialForm
          material={editingMaterial}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      )}
    </div>
  );
};

export default MaterialsTable;
