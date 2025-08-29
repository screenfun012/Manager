import React, { useState, useEffect } from 'react';
import { Save, X, Edit3 } from 'lucide-react';

const EditMaterialForm = ({ material, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    department: '',
    assignedTo: '',
    assignmentDate: ''
  });

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || '',
        category: material.category || '',
        department: material.department || '',
        assignedTo: material.assignedTo || '',
        assignmentDate: material.assignmentDate || new Date().toISOString().split('T')[0]
      });
    }
  }, [material]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      alert('Molimo popunite sva obavezna polja');
      return;
    }

    const updatedMaterial = {
      ...material,
      name: formData.name.trim(),
      category: formData.category,
      department: formData.department,
      assignedTo: formData.assignedTo,
      assignmentDate: formData.assignmentDate
    };

    onSave(updatedMaterial);
  };

  if (!material) return null;

  return (
    <div style={{ 
      background: '#1f2937', 
      padding: '1.5rem', 
      borderRadius: '12px', 
      border: '2px solid #374151',
      marginTop: '1rem'
    }}>
      <h3 style={{ marginBottom: '1rem', color: '#ffffff' }}>
        <Edit3 size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Izmeni Materijal: {material.name}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Naziv Materijala *</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Kategorija *</label>
          <input
            type="text"
            id="category"
            name="category"
            className="form-control"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="department">Odeljenje</label>
          <input
            type="text"
            id="department"
            name="department"
            className="form-control"
            value={formData.department}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="assignedTo">Zadužen Korisnik</label>
          <input
            type="text"
            id="assignedTo"
            name="assignedTo"
            className="form-control"
            value={formData.assignedTo}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="assignmentDate">Datum Zaduženja</label>
          <input
            type="date"
            id="assignmentDate"
            name="assignmentDate"
            className="form-control"
            value={formData.assignmentDate}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn">
            <Save size={20} />
            Sačuvaj Izmene
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

export default EditMaterialForm;
