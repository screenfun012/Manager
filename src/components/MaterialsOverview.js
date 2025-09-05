import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { materialsAPI } from '../services/api';
import eventBus, { EVENTS } from '../services/eventBus';

const MaterialsOverview = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMaterials = async () => {
    console.log('🔄 MaterialsOverview: Loading materials...');
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await materialsAPI.getAll();
      console.log('🔄 MaterialsOverview: Materials loaded:', data);
      setMaterials(data);
      setFilteredMaterials(data);
    } catch (error) {
      console.error('Greška pri učitavanju materijala:', error);
      // Umesto greške, koristimo prazan niz
      setMaterials([]);
      setFilteredMaterials([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    // Slušaj evente za real-time ažuriranje
    const unsubscribeMaterialCreated = eventBus.on(EVENTS.MATERIAL_CREATED, (data) => {
      console.log('🔄 MaterialsOverview: Material created event received:', data);
      loadMaterials();
    });

    const unsubscribeMaterialUpdated = eventBus.on(EVENTS.MATERIAL_UPDATED, (data) => {
      console.log('🔄 MaterialsOverview: Material updated event received:', data);
      loadMaterials();
    });

    const unsubscribeMaterialDeleted = eventBus.on(EVENTS.MATERIAL_DELETED, (data) => {
      console.log('🔄 MaterialsOverview: Material deleted event received:', data);
      loadMaterials();
    });

    return () => {
      unsubscribeMaterialCreated();
      unsubscribeMaterialUpdated();
      unsubscribeMaterialDeleted();
    };
  }, []);

  useEffect(() => {
    let filtered = materials;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(material => material.category === categoryFilter);
    }

    // Stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter(material => material.quantity <= material.minQuantity);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(material => material.quantity === 0);
    } else if (stockFilter === 'inStock') {
      filtered = filtered.filter(material => material.quantity > material.minQuantity);
    }

    setFilteredMaterials(filtered);
  }, [materials, searchTerm, categoryFilter, stockFilter]);

  const getCategories = () => {
    const categories = [...new Set(materials.map(m => m.category))];
    return categories.sort();
  };

  const getStockStatus = (material) => {
    if (material.quantity === 0) return { status: 'out', color: '#ef4444', text: 'Nema na stanju' };
    if (material.quantity <= material.minQuantity) return { status: 'low', color: '#f59e0b', text: 'Niska zaliha' };
    return { status: 'ok', color: '#10b981', text: 'U redu' };
  };

  const getStockIcon = (material) => {
    const status = getStockStatus(material);
    if (status.status === 'out') return <AlertTriangle size={16} style={{ color: status.color }} />;
    if (status.status === 'low') return <AlertTriangle size={16} style={{ color: status.color }} />;
    return <CheckCircle size={16} style={{ color: status.color }} />;
  };

  // Uklonjen error handling - koristimo prazan niz umesto greške

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
            📦 Pregled Materijala
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
            Ukupno: {materials.length} materijala • Prikazano: {filteredMaterials.length}
          </p>
        </div>
        <button
          onClick={loadMaterials}
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
          <Package size={16} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          {isLoading ? 'Učitavam...' : 'Osveži'}
        </button>
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
            placeholder="Naziv ili kategorija..."
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
            📂 Kategorija
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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
            <option value="">Sve kategorije</option>
            {getCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ color: '#d1d5db', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
            📊 Stanje zaliha
          </label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
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
            <option value="all">Sve</option>
            <option value="inStock">U redu</option>
            <option value="low">Niska zaliha</option>
            <option value="out">Nema na stanju</option>
          </select>
        </div>
      </div>

      {/* Materials List */}
      <div style={{
        maxHeight: '500px',
        overflowY: 'auto',
        border: '1px solid #374151',
        borderRadius: '8px'
      }}>
        {filteredMaterials.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredMaterials.map((material, index) => {
              const stockStatus = getStockStatus(material);
              return (
                <div key={material.id} style={{
                  padding: '1rem',
                  borderBottom: index < filteredMaterials.length - 1 ? '1px solid #374151' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: index % 2 === 0 ? '#1f2937' : '#111827'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {getStockIcon(material)}
                      <span style={{ color: '#ffffff', fontWeight: '500', fontSize: '1rem' }}>
                        {material.name}
                      </span>
                      <span style={{
                        background: stockStatus.color,
                        color: '#ffffff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {stockStatus.text}
                      </span>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                      Kategorija: {material.category} • Jedinica: {material.unit}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: '600' }}>
                      {material.quantity}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                      Min: {material.minQuantity}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            {searchTerm || categoryFilter || stockFilter !== 'all' ? 'Nema rezultata za odabrane filtere' : 'Nema materijala'}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginTop: '1rem',
        padding: '1rem',
        background: '#374151',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '600' }}>
            {materials.filter(m => m.quantity > m.minQuantity).length}
          </div>
          <div style={{ color: '#d1d5db', fontSize: '0.9rem' }}>U redu</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: '600' }}>
            {materials.filter(m => m.quantity > 0 && m.quantity <= m.minQuantity).length}
          </div>
          <div style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Niska zaliha</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: '600' }}>
            {materials.filter(m => m.quantity === 0).length}
          </div>
          <div style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Nema na stanju</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: '600' }}>
            {getCategories().length}
          </div>
          <div style={{ color: '#d1d5db', fontSize: '0.9rem' }}>Kategorija</div>
        </div>
      </div>
    </div>
  );
};

export default MaterialsOverview;
