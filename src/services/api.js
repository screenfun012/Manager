import eventBus, { EVENTS } from './eventBus';

const API_BASE_URL = 'http://localhost:5001/api';

// Helper funkcija za API pozive
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Emituj event ako ga backend vraća
    if (data.event) {
      console.log('🔄 API poziv završen, emitujem event:', data.event);
      eventBus.emit(data.event, data);
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// API za materijale
export const materialsAPI = {
  // Učitaj sve materijale
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/materials?${queryString}` : '/materials';
    
    return await apiCall(endpoint);
  },

  // Dodaj novi materijal
  create: async (materialData) => {
    return await apiCall('/materials', {
      method: 'POST',
      body: JSON.stringify(materialData),
    });
  },

  // Ažuriraj materijal
  update: async (id, materialData) => {
    return await apiCall(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(materialData),
    });
  },

  // Obriši materijal
  delete: async (id) => {
    return await apiCall(`/materials/${id}`, {
      method: 'DELETE',
    });
  },
};

// API za zaposlene
export const employeesAPI = {
  // Učitaj sve zaposlene
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.department) params.append('department', filters.department);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/employees?${queryString}` : '/employees';
    
    return await apiCall(endpoint);
  },

  // Dodaj novog zaposlenog
  create: async (employeeData) => {
    return await apiCall('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  },

  // Ažuriraj zaposlenog
  update: async (id, employeeData) => {
    return await apiCall(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  },

  // Obriši zaposlenog
  delete: async (id) => {
    return await apiCall(`/employees/${id}`, {
      method: 'DELETE',
    });
  },
};

// API za zaduženja
export const assignmentsAPI = {
  // Učitaj sva zaduženja
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.material_id) params.append('material_id', filters.material_id);
    if (filters.employee_id) params.append('employee_id', filters.employee_id);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/assignments?${queryString}` : '/assignments';
    
    return await apiCall(endpoint);
  },

  // Dodaj novo zaduženje
  create: async (assignmentData) => {
    return await apiCall('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },

  // Ažuriraj zaduženje
  update: async (id, assignmentData) => {
    return await apiCall(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  },

  // Obriši zaduženje
  delete: async (id) => {
    return await apiCall(`/assignments/${id}`, {
      method: 'DELETE',
    });
  },

  // Obriši sva zaduženja za materijal
  deleteByMaterialId: async (materialId) => {
    return await apiCall(`/assignments/material/${materialId}`, {
      method: 'DELETE',
    });
  },
};

// API za statistike
export const statsAPI = {
  // Učitaj pregled statistika
  getOverview: async () => {
    return await apiCall('/stats/overview');
  },
};

// API za health check
export const healthAPI = {
  // Proveri status API-ja
  check: async () => {
    return await apiCall('/health');
  },
};

// Fallback funkcije za slučaj da API nije dostupan
export const fallbackData = {
  materials: [
    { id: 1, category: 'POTROSNI MATERIJAL', name: 'nitro razredjivac pentico', stockQuantity: 50, unit: 'kom', minStock: 10 },
    { id: 2, category: 'ZASTITNA OPREMA', name: 'rukavice radne', stockQuantity: 200, unit: 'par', minStock: 50 },
  ],
  employees: [
    { id: 1, name: 'Marko Petrović', department: 'Proizvodnja', position: 'Proizvodni radnik', phone: '061-123-456' },
    { id: 2, name: 'Ana Jovanović', department: 'Održavanje', position: 'Tehničar', phone: '061-234-567' },
  ],
};

// Funkcija za proveru da li je API dostupan
export const isAPIAvailable = async () => {
  try {
    await healthAPI.check();
    return true;
  } catch (error) {
    console.warn('API nije dostupan, koristim fallback podatke');
    return false;
  }
};

// Glavna funkcija za učitavanje podataka sa fallback-om
export const loadDataWithFallback = async (apiFunction, fallbackData) => {
  try {
    if (await isAPIAvailable()) {
      return await apiFunction();
    } else {
      return fallbackData;
    }
  } catch (error) {
    console.warn('Greška pri učitavanju podataka, koristim fallback:', error);
    return fallbackData;
  }
};

// ===== ADMIN API FUNKCIJE =====

// API za admin funkcionalnosti
export const adminAPI = {
  // Dobavi informacije o bazi podataka
  getDatabaseInfo: async () => {
    return await apiCall('/admin/database-info');
  },

  // Pokreni ručno čišćenje
  runCleanup: async () => {
    return await apiCall('/admin/cleanup', {
      method: 'POST',
    });
  },

  // Pokreni rebuild keša i re-sync zaliha
  rebuildCache: async () => {
    return await apiCall('/admin/rebuild-cache', {
      method: 'POST',
    });
  },
};

// Direktne funkcije za admin panel
export const getDatabaseInfo = async (period = null) => {
  const params = period ? {
    from: period.from.toISOString(),
    to: period.to.toISOString()
  } : {};
  
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/database-info?${queryString}` : '/admin/database-info';
  
  return await apiCall(endpoint);
};

export const runCleanup = async () => {
  return await adminAPI.runCleanup();
};

export const rebuildCache = async () => {
  return await adminAPI.rebuildCache();
};
