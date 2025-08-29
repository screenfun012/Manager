import React, { useState } from 'react';
import { Save, X, Package, Users, Info, AlertTriangle } from 'lucide-react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const MaterialAssignmentForm = ({ 
  materialsDB, 
  employeesDB, 
  onAssign, 
  onCancel,
  currentDate 
}) => {
  const [formData, setFormData] = useState({
    materialId: '',
    employeeId: '',
    quantity: 1,
    notes: ''
  });

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Ažuriram selektovane objekte
    if (name === 'materialId') {
      const material = materialsDB.find(m => m.id === parseInt(value));
      setSelectedMaterial(material);
    } else if (name === 'employeeId') {
      const employee = employeesDB.find(e => e.id === parseInt(value));
      setSelectedEmployee(employee);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.materialId || !formData.employeeId || !formData.quantity) {
      alert('Molimo popunite sva obavezna polja');
      return;
    }

    if (selectedMaterial && formData.quantity > selectedMaterial.stockQuantity) {
      alert(`Nema dovoljno materijala na stanju. Dostupno: ${selectedMaterial.stockQuantity} ${selectedMaterial.unit}`);
      return;
    }

    console.log('🔍 MaterialAssignmentForm - onAssign pozvan sa:', {
      materialId: parseInt(formData.materialId),
      quantity: parseInt(formData.quantity),
      date: currentDate,
      material: selectedMaterial,
      employee: selectedEmployee
    });
    
    onAssign({
      materialId: parseInt(formData.materialId),
      quantity: parseInt(formData.quantity),
      date: currentDate,
      material: selectedMaterial,
      employee: selectedEmployee
    });

    // Reset form
    setFormData({
      materialId: '',
      employeeId: '',
      quantity: 1,
      notes: ''
    });
    setSelectedMaterial(null);
    setSelectedEmployee(null);
  };

  return (
    <div style={{ 
      background: '#1f2937', 
      padding: '1.5rem', 
      borderRadius: '12px', 
      border: '2px solid #374151',
      marginTop: '1rem'
    }}>
      <h3 style={{ marginBottom: '1rem', color: '#ffffff', borderBottom: '2px solid #dc2626', paddingBottom: '0.5rem' }}>
        <Package size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Zaduženje Materijala - {currentDate}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="materialId">Materijal *</label>
          <DropdownButton
            id="materialId"
            title={selectedMaterial ? `${selectedMaterial.name}` : "Izaberite materijal"}
            variant="outline-secondary"
            style={{ 
              width: '100%',
              textAlign: 'left',
              background: '#334155',
              border: '2px solid #475569',
              color: '#e2e8f0'
            }}
            className="custom-dropdown"
          >
            {materialsDB.map(material => (
              <Dropdown.Item 
                key={material.id} 
                eventKey={material.id}
                onClick={() => {
                  setFormData(prev => ({ ...prev, materialId: material.id }));
                  setSelectedMaterial(material);
                }}
                style={{
                  background: selectedMaterial?.id === material.id ? '#dc2626' : '#334155',
                  color: selectedMaterial?.id === material.id ? '#ffffff' : '#e2e8f0',
                  border: 'none',
                  padding: '0.75rem 1rem'
                }}
              >
                <Package size={16} style={{ marginRight: '0.5rem' }} />
                {material.name} - Stanje: {material.stockQuantity} {material.unit}
              </Dropdown.Item>
            ))}
          </DropdownButton>
          
          {/* Warning za nisko stanje */}
          {selectedMaterial && selectedMaterial.stockQuantity <= selectedMaterial.minStock && (
            <div className="low-stock-warning" style={{
              background: '#7f1d1d',
              border: '1px solid #dc2626',
              color: '#fca5a5',
              padding: '0.5rem',
              borderRadius: '6px',
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={16} style={{ color: '#fbbf24' }} />
              <span>Nisko stanje! Minimalno stanje: {selectedMaterial.minStock} {selectedMaterial.unit}</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="employeeId">Zadužen Radnik *</label>
          <DropdownButton
            id="employeeId"
            title={selectedEmployee ? `${selectedEmployee.name}` : "Izaberite radnika"}
            variant="outline-secondary"
            style={{ 
              width: '100%',
              textAlign: 'left',
              background: '#334155',
              border: '2px solid #475569',
              color: '#e2e8f0'
            }}
            className="custom-dropdown"
          >
            {employeesDB.map(employee => (
              <Dropdown.Item 
                key={employee.id} 
                eventKey={employee.id}
                onClick={() => {
                  setFormData(prev => ({ ...prev, employeeId: employee.id }));
                  setSelectedEmployee(employee);
                }}
                style={{
                  background: selectedEmployee?.id === employee.id ? '#dc2626' : '#334155',
                  color: selectedEmployee?.id === employee.id ? '#ffffff' : '#e2e8f0',
                  border: 'none',
                  padding: '0.75rem 1rem'
                }}
              >
                <Users size={16} style={{ marginRight: '0.5rem' }} />
                {employee.name} - {employee.department} ({employee.position})
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Količina *</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            className="form-control"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            max={selectedMaterial ? selectedMaterial.stockQuantity : undefined}
            style={{
              borderColor: selectedMaterial && formData.quantity > selectedMaterial.stockQuantity ? '#dc2626' : undefined
            }}
          />
          
          {/* Warning za preveliku količinu */}
          {selectedMaterial && formData.quantity > selectedMaterial.stockQuantity && (
            <div className="quantity-warning" style={{
              background: '#7f1d1d',
              border: '1px solid #dc2626',
              color: '#fca5a5',
              padding: '0.5rem',
              borderRadius: '6px',
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={16} style={{ color: '#fca5a5' }} />
              <span>Prevelika količina! Dostupno na stanju: {selectedMaterial.stockQuantity} {selectedMaterial.unit}</span>
            </div>
          )}
          
          {/* Info o dostupnom stanju */}
          {selectedMaterial && (
            <div className="stock-info" style={{
              background: '#1e293b',
              border: '1px solid #475569',
              color: '#94a3b8',
              padding: '0.5rem',
              borderRadius: '6px',
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Info size={16} style={{ color: '#60a5fa' }} />
              <span>Dostupno na stanju: {selectedMaterial.stockQuantity} {selectedMaterial.unit}</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Napomena (opciono)</label>
          <textarea
            id="notes"
            name="notes"
            className="form-control"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Unesite napomenu o zaduženju"
            rows="2"
          />
        </div>

        {/* Prikaz selektovanog materijala i radnika */}
        {(selectedMaterial || selectedEmployee) && (
          <div style={{ 
            background: '#374151', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            border: '1px solid #4b5563'
          }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#ffffff' }}>Pregled zaduženja:</h4>
            {selectedMaterial && (
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Materijal:</strong> {selectedMaterial.name} ({selectedMaterial.category})
              </p>
            )}
            {selectedEmployee && (
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Radnik:</strong> {selectedEmployee.name} - {selectedEmployee.department}
              </p>
            )}
            {selectedMaterial && selectedEmployee && (
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Količina:</strong> {formData.quantity} {selectedMaterial.unit}
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn">
            <Save size={20} />
            Zaduži Materijal
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
          >
            <X size={20} />
            Otkaži
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaterialAssignmentForm;
