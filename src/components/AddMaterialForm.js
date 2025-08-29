import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { Save, X, Package, Check } from 'lucide-react';

const AddMaterialForm = ({ categories, departments, users, materialsDB, onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    category: categories[0] || '',
    name: '',
    description: '',
    department: departments[0] || '', // Dodajem odeljenje
    assignedTo: users[0] || '', // Dodajem korisnika
    quantity: '', // Dodajem količinu
    unit: 'kom' // Dodajem jedinicu mere
  });

  const [useExistingMaterial, setUseExistingMaterial] = useState(false);
  const [selectedExistingMaterial, setSelectedExistingMaterial] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.category || !formData.name.trim() || !formData.quantity || !formData.unit) {
      alert('Molimo popunite sva obavezna polja');
      return;
    }

    onAdd({
      category: formData.category,
      name: formData.name.trim(),
      description: formData.description.trim(),
      department: formData.department,
      assignedTo: formData.assignedTo,
      quantity: parseInt(formData.quantity),
      unit: formData.unit
    });

    // Reset form
    setFormData({
      category: categories[0] || '',
      name: '',
      description: '',
      department: departments[0] || '',
      assignedTo: users[0] || '',
      quantity: '',
      unit: 'kom'
    });
  };

  return (
    <div style={{ 
      background: '#1f2937', 
      padding: '1.5rem', 
      borderRadius: '12px', 
      border: '2px solid #374151',
      marginTop: '1rem'
    }}>
      <h3 style={{ 
        marginBottom: '1.5rem', 
        color: '#ffffff',
        borderBottom: '2px solid #dc2626',
        paddingBottom: '0.5rem'
      }}>
        Dodaj Novi Materijal
      </h3>
      
      <form onSubmit={handleSubmit}>
        {/* Opcija za izbor postojećeg materijala */}
        <div className="form-group" style={{ 
          marginBottom: '1.5rem',
          padding: '1rem',
          background: '#374151',
          borderRadius: '8px',
          border: '1px solid #4b5563'
        }}>
                      <label style={{ 
              color: '#ffffff', 
              marginBottom: '0.5rem', 
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              <input
                type="checkbox"
                checked={useExistingMaterial}
                onChange={(e) => setUseExistingMaterial(e.target.checked)}
                style={{ 
                  marginRight: '0.75rem',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <Package size={16} style={{ marginRight: '0.5rem' }} />
              <span>Koristi postojeći materijal iz magacina</span>
            </label>
        </div>

        {useExistingMaterial && (
          <div className="form-group" style={{ 
            marginBottom: '1.5rem',
            padding: '1rem',
            background: '#1e293b',
            borderRadius: '8px',
            border: '2px solid #dc2626'
          }}>
            <label htmlFor="existingMaterial" style={{ 
              color: '#ffffff', 
              marginBottom: '0.75rem', 
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              <Package size={18} style={{ marginRight: '0.5rem' }} />
              Izaberi postojeći materijal *
            </label>
            <DropdownButton
              id="existingMaterial"
              title={selectedExistingMaterial ? `${selectedExistingMaterial.name}` : "Izaberi materijal..."}
              variant="outline-secondary"
              style={{ 
                width: '100%',
                textAlign: 'left'
              }}
              className="custom-dropdown"
            >
              {materialsDB.map(material => (
                <Dropdown.Item 
                  key={material.id} 
                  eventKey={material.id}
                  onClick={() => {
                    setSelectedExistingMaterial(material);
                    setFormData(prev => ({
                      ...prev,
                      category: material.category,
                      name: material.name,
                      department: departments[0] || '',
                      assignedTo: users[0] || ''
                    }));
                  }}
                  style={{
                    background: selectedExistingMaterial?.id === material.id ? '#dc2626' : '#334155',
                    color: selectedExistingMaterial?.id === material.id ? '#ffffff' : '#e2e8f0',
                    border: 'none',
                    padding: '0.75rem 1rem'
                  }}
                >
                  <Package size={16} style={{ marginRight: '0.5rem' }} />
                  {material.name} - {material.category} (Stanje: {material.stockQuantity} {material.unit})
                </Dropdown.Item>
              ))}
            </DropdownButton>
            
            {/* Info o izabranom materijalu */}
            {selectedExistingMaterial && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.5rem',
                background: '#374151',
                borderRadius: '6px',
                border: '1px solid #4b5563',
                fontSize: '0.875rem'
              }}>
                <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Check size={14} style={{ color: '#dc2626' }} />
                  Izabran: <strong style={{ color: '#ffffff' }}>{selectedExistingMaterial.name}</strong>
                  ({selectedExistingMaterial.category}) - Stanje: {selectedExistingMaterial.stockQuantity} {selectedExistingMaterial.unit}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Grid layout za kompaktniji prikaz */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div className="form-group">
            <label htmlFor="category" style={{ color: '#ffffff', marginBottom: '0.5rem', display: 'block' }}>
              Kategorija *
            </label>
            <DropdownButton
              id="category"
              title={formData.category || "Izaberi kategoriju"}
              variant="outline-secondary"
              style={{ 
                width: '100%',
                textAlign: 'left'
              }}
              className="custom-dropdown"
            >
              {categories.map(category => (
                <Dropdown.Item 
                  key={category} 
                  eventKey={category}
                  onClick={() => handleChange({ target: { name: 'category', value: category } })}
                  style={{
                    background: formData.category === category ? '#dc2626' : '#334155',
                    color: formData.category === category ? '#ffffff' : '#e2e8f0',
                    border: 'none',
                    padding: '0.75rem 1rem'
                  }}
                >
                  {category}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </div>

          <div className="form-group">
            <label htmlFor="department" style={{ color: '#ffffff', marginBottom: '0.5rem', display: 'block' }}>
              Odeljenje *
            </label>
            <DropdownButton
              id="department"
              title={formData.department || "Izaberi odeljenje"}
              variant="outline-secondary"
              style={{ 
                width: '100%',
                textAlign: 'left'
              }}
              className="custom-dropdown"
            >
              {departments.map(dept => (
                <Dropdown.Item 
                  key={dept} 
                  eventKey={dept}
                  onClick={() => handleChange({ target: { name: 'department', value: dept } })}
                  style={{
                    background: formData.department === dept ? '#dc2626' : '#334155',
                    color: formData.department === dept ? '#ffffff' : '#e2e8f0',
                    border: 'none',
                    padding: '0.75rem 1rem'
                  }}
                >
                  {dept}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="name" style={{ color: '#ffffff', marginBottom: '0.5rem', display: 'block' }}>
            Naziv Materijala *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            placeholder="Unesite naziv materijala"
            required
            disabled={useExistingMaterial}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" style={{ color: '#ffffff', marginBottom: '0.5rem', display: 'block' }}>
            Opis (opciono)
          </label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            placeholder="Unesite opis materijala"
            rows="3"
            disabled={useExistingMaterial}
          />
        </div>

        {/* Grid layout za količinu i jedinicu */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <div className="form-group">
            <label htmlFor="quantity" style={{ color: '#ffffff', marginBottom: '0.5rem', display: 'block' }}>
              Količina *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              className="form-control"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Unesite količinu"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit" style={{ color: '#ffffff', marginBottom: '0.5rem', display: 'block' }}>
              Jedinica *
            </label>
            <DropdownButton
              id="unit"
              title={formData.unit || "Izaberi jedinicu"}
              variant="outline-secondary"
              style={{
                width: '100%',
                textAlign: 'left'
              }}
              className="custom-dropdown"
            >
              {['kom', 'kg', 'l', 'm', 'm²', 'm³'].map(unit => (
                <Dropdown.Item
                  key={unit}
                  eventKey={unit}
                  onClick={() => handleChange({ target: { name: 'unit', value: unit } })}
                  style={{
                    background: formData.unit === unit ? '#dc2626' : '#334155',
                    color: formData.unit === unit ? '#ffffff' : '#e2e8f0',
                    border: 'none',
                    padding: '0.75rem 1rem'
                  }}
                >
                  {unit}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="assignedTo" style={{ color: '#ffffff', marginBottom: '0.5rem', display: 'block' }}>
            Zadužen Korisnik *
          </label>
          <DropdownButton
            id="assignedTo"
            title={formData.assignedTo || "Izaberi korisnika"}
            variant="outline-secondary"
            style={{ 
              maxWidth: '300px',
              textAlign: 'left'
            }}
            className="custom-dropdown"
          >
            {users.map(user => (
              <Dropdown.Item 
                key={user} 
                eventKey={user}
                onClick={() => handleChange({ target: { name: 'assignedTo', value: user } })}
                style={{
                  background: formData.assignedTo === user ? '#dc2626' : '#334155',
                  color: formData.assignedTo === user ? '#ffffff' : '#e2e8f0',
                  border: 'none',
                  padding: '0.75rem 1rem'
                }}
              >
                {user}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn">
            <Save size={20} />
            Sačuvaj Materijal
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

export default AddMaterialForm;
