import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import MaterialsTable from './components/MaterialsTable';
import ExcelUploader from './components/ExcelUploader';
import AddMaterialForm from './components/AddMaterialForm';
import MaterialAssignmentForm from './components/MaterialAssignmentForm';
// import EditMaterialForm from './components/EditMaterialForm'; // Temporarily unused
import WordExporter from './components/WordExporter';
import SimpleAdminPanel from './components/SimpleAdminPanel';
import FantasticalCalendar from './components/FantasticalCalendar';
import DetailedExport from './components/DetailedExport';


import { Plus, FileSpreadsheet, FileText, UserCheck, AlertTriangle, Search, Upload, FileDown, Database, RefreshCw, Loader2, RotateCcw, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { materialsAPI, employeesAPI, assignmentsAPI, loadDataWithFallback, fallbackData, getDatabaseInfo } from './services/api';
import eventBus, { EVENTS } from './services/eventBus';
import { 
  getDefaultCurrentMonthPeriod, 
  getDefaultPreviousMonthPeriod, 
  getDefaultNextMonthPeriod,
  shouldAutoSwitchToNewMonth,
  emitMonthChangedEvent,
  formatDateForAPI,
  getCurrentMonthName,
  getCurrentBelgradeDate
} from './services/dateUtils';
import { saveAsWorkflow, showToast } from './services/fileUtils';
import offlineQueueService from './services/offlineQueue';

// Sample data arrays - premestam izvan komponente da ne bi se redefinisali pri svakom renderovanju
const sampleCategories = [
  'POTROSNI MATERIJAL',
  'ZASTITNA OPREMA',
  'MESINGANE CETKE',
  'HIGIJENA',
  'AMBALAZA',
  'ALAT'
];

// Mesec nazivi na srpskom
const monthNames = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
];

const sampleDepartments = [
  'Proizvodnja',
  'Održavanje',
  'Kontrola kvaliteta',
  'Logistika',
  'Administracija',
  'IT Odeljenje'
];

const sampleUsers = [
  'Marko Petrović',
  'Ana Jovanović',
  'Petar Nikolić',
  'Marija Đorđević',
  'Stefan Stojanović',
  'Jelena Marković'
];

// Fallback podaci za slučaj da API nije dostupan
const fallbackMaterials = fallbackData.materials;
const fallbackEmployees = fallbackData.employees;

// Funkcija za konvertovanje zaduženja u materijale za dashboard
const processAssignmentsToMaterials = (assignments, materialsDB, employeesDB) => {
  const materialMap = new Map();
  
  assignments.forEach(assignment => {
    const material = materialsDB.find(m => m.id === assignment.material_id);
    const employee = employeesDB.find(e => e.id === assignment.employee_id);
    
    if (material && employee) {
      const key = `${material.id}-${employee.department}`;
      
      if (!materialMap.has(key)) {
        materialMap.set(key, {
          id: material.id,
          category: material.category,
          name: material.name,
          department: employee.department,
          assignedTo: employee.name,
          quantities: {},
          total: 0
        });
      }
      
      const materialData = materialMap.get(key);
      const dateKey = new Date(assignment.created_at).toLocaleDateString('sr-RS', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      
      if (!materialData.quantities[dateKey]) {
        materialData.quantities[dateKey] = 0;
      }
      materialData.quantities[dateKey] += assignment.quantity;
      materialData.total += assignment.quantity;
    }
  });
  
  return Array.from(materialMap.values());
};

function App() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]); // Nova state varijabla
  const [users, setUsers] = useState([]); // Nova state varijabla
  const [materialsDB, setMaterialsDB] = useState([]); // Baza materijala
  const [employeesDB, setEmployeesDB] = useState([]); // Baza zaposlenih
  const [assignments, setAssignments] = useState([]); // Zaduženja
  const [selectedMonth] = useState('08');
  const [selectedYear] = useState('2024');
  
  // State za trenutni mesec i godinu
  const [currentMonth, setCurrentMonth] = useState(8); // Septembar (0-based)
  const [currentYear, setCurrentYear] = useState(2025);
  
  // Kreiranje period objekta na osnovu state-a
  const currentMonthPeriod = {
    from: new Date(currentYear, currentMonth, 1),
    to: new Date(currentYear, currentMonth + 1, 0),
    label: `${monthNames[currentMonth]} ${currentYear}`
  };

  // Funkcija za navigaciju kroz mesece
  const handleMonthChange = (direction) => {
    if (direction === 'previous') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (direction === 'next') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false); // Forma za zaduženje
  const [activeTab, setActiveTab] = useState('dashboard'); // Aktivni tab
  const [searchTerm, setSearchTerm] = useState(''); // Pretraga za dashboard
  const [inventorySearchTerm, setInventorySearchTerm] = useState(''); // Pretraga za inventory
  const [exportDepartment, setExportDepartment] = useState(''); // Filter za export po odeljenju
  const [exportEmployee, setExportEmployee] = useState(''); // Filter za export po radniku
  const [exportFormat, setExportFormat] = useState('excel'); // Format za export (excel/word)
  const [exportDateFrom, setExportDateFrom] = useState(''); // Filter za export od datuma
  const [exportDateTo, setExportDateTo] = useState(''); // Filter za export do datuma
  const [exportCategory, setExportCategory] = useState(''); // Filter za export po kategoriji
  const [isLoading, setIsLoading] = useState(true); // Loading state za API pozive
  const [apiError, setApiError] = useState(null); // Error state za API greške
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true); // Automatsko osvežavanje
  const [lastRefreshTime, setLastRefreshTime] = useState(null); // Vreme poslednjeg osvežavanja
  const [isOffline, setIsOffline] = useState(!navigator.onLine); // Offline status
  const [offlineQueueStats, setOfflineQueueStats] = useState({ total: 0, pending: 0, failed: 0 }); // Offline queue statistike


  // Trenutni materijali u sistemu (sa zaduženjima)
  const sampleMaterials = [
    {
      id: 1,
      category: 'POTROSNI MATERIJAL',
      name: 'nitro razredjivac pentico',
      department: 'Proizvodnja',
      assignedTo: 'Marko Petrović',
      quantities: {
        '01.08.': 5,
        '04.08.': 6,
        '05.08.': 5,
        '06.08.': 0,
        '07.08.': 0,
        '08.08.': 0,
        '11.08.': 0,
        '12.08.': 0,
        '13.08.': 0,
        '14.08.': 0,
        '15.08.': 0,
        '18.08.': 0,
        '19.08.': 0,
        '20.08.': 0,
        '21.08.': 0,
        '22.08.': 0,
        '25.08.': 0,
        '26.08.': 0,
        '27.08.': 0,
        '28.08.': 0,
        '29.08.': 0
      },
      total: 16
    },
    {
      id: 2,
      category: 'POTROSNI MATERIJAL',
      name: 'odmascivac forch eco 500ml',
      department: 'Održavanje',
      assignedTo: 'Petar Nikolić',
      quantities: {
        '01.08.': 7,
        '04.08.': 17,
        '05.08.': 7,
        '06.08.': 0,
        '07.08.': 0,
        '08.08.': 0,
        '11.08.': 0,
        '12.08.': 0,
        '13.08.': 0,
        '14.08.': 0,
        '15.08.': 0,
        '18.08.': 0,
        '19.08.': 0,
        '20.08.': 0,
        '21.08.': 0,
        '22.08.': 0,
        '25.08.': 0,
        '26.08.': 0,
        '27.08.': 0,
        '28.08.': 0,
        '29.08.': 0
      },
      total: 31
    },
    {
      id: 3,
      category: 'POTROSNI MATERIJAL',
      name: 'crni silikon DIHT MASA CRNA DIRKO 320C',
      department: 'Kontrola kvaliteta',
      assignedTo: 'Stefan Stojanović',
      quantities: {
        '01.08.': 0,
        '04.08.': 5,
        '05.08.': 0,
        '06.08.': 0,
        '07.08.': 0,
        '08.08.': 0,
        '11.08.': 0,
        '12.08.': 0,
        '13.08.': 0,
        '14.08.': 0,
        '15.08.': 0,
        '18.08.': 0,
        '19.08.': 0,
        '20.08.': 0,
        '21.08.': 0,
        '22.08.': 0,
        '25.08.': 0,
        '26.08.': 0,
        '27.08.': 0,
        '28.08.': 0,
        '29.08.': 0
      },
      total: 5
    }
  ];

  useEffect(() => {
    // Initialize with sample data
    setCategories(sampleCategories);
    setDepartments(sampleDepartments);
    setUsers(sampleUsers);
    
    // Uklonjeno automatsko prebacivanje na novi mesec
    
    // Uklonjen event listener za promenu meseca
    
    // Učitavanje podataka iz API-ja sa fallback-om
    const loadData = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        console.log('🔄 Učitavam podatke iz API-ja...');
        
        // Učitavanje materijala iz API-ja
        const materialsData = await loadDataWithFallback(
          () => materialsAPI.getAll(),
          fallbackMaterials
        );
        setMaterialsDB(materialsData);
        console.log('✅ Materijali učitani:', materialsData.length);
        
        // Učitavanje zaposlenih iz API-ja
        const employeesData = await loadDataWithFallback(
          () => employeesAPI.getAll(),
          fallbackEmployees
        );
        setEmployeesDB(employeesData);
        console.log('✅ Zaposleni učitani:', employeesData.length);
        
        // Učitavanje zaduženja iz API-ja
        const assignmentsData = await loadDataWithFallback(
          () => assignmentsAPI.getAll(),
          []
        );
        setAssignments(assignmentsData);
        console.log('✅ Zaduženja učitana:', assignmentsData.length);
        
        // Generisanje materijala za dashboard na osnovu zaduženja
        const processedMaterials = processAssignmentsToMaterials(assignmentsData, materialsData, employeesData);
        setMaterials(processedMaterials);
        console.log('✅ Materijali za dashboard generisani:', processedMaterials.length);
        
      } catch (error) {
        console.error('❌ Greška pri učitavanju podataka:', error);
        setApiError(error.message);
        // Fallback na statičke podatke
        setMaterialsDB(fallbackMaterials);
        setEmployeesDB(fallbackEmployees);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      // Uklonjen cleanup za event listener
    };
  }, []); // Empty dependency array since these are static arrays

  // useEffect za automatsko osvežavanje (dinamički)
  useEffect(() => {
    let autoRefreshInterval;
    
    if (autoRefreshEnabled) {
      console.log('🔄 Uključujem automatsko osvežavanje podataka...');
      autoRefreshInterval = setInterval(autoRefreshData, 5 * 60 * 1000); // 5 minuta
    }
    
    // Cleanup interval-a kada se komponenta unmount-uje ili se promeni autoRefreshEnabled
    return () => {
      if (autoRefreshInterval) {
        console.log('⏸️ Isključujem automatsko osvežavanje podataka...');
        clearInterval(autoRefreshInterval);
      }
    };
  }, [autoRefreshEnabled]); // Dependency na autoRefreshEnabled

  // useEffect za Service Worker registraciju
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          console.log('🔄 Registrujem Service Worker...');
          
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('✅ Service Worker registrovan:', registration);
          
          // Proveri da li je Service Worker aktivan
          if (registration.active) {
            console.log('✅ Service Worker aktivan');
          }
          
          // Event listeneri za Service Worker
          registration.addEventListener('updatefound', () => {
            console.log('🔄 Service Worker update pronađen');
          });
          
        } catch (error) {
          console.error('❌ Greška pri registraciji Service Worker-a:', error);
        }
      } else {
        console.log('⚠️ Service Worker nije podržan u ovom browser-u');
      }
    };
    
    registerServiceWorker();
  }, []);

  // useEffect za offline status i queue monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Online - konekcija vraćena');
      setIsOffline(false);
    };

    const handleOffline = () => {
      console.log('📡 Offline - konekcija izgubljena');
      setIsOffline(true);
    };

    const updateQueueStats = () => {
      const stats = offlineQueueService.getQueueStats();
      setOfflineQueueStats(stats);
    };

    // Event listeneri
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Periodično ažuriranje queue statistika
    const statsInterval = setInterval(updateQueueStats, 5000);
    
    // Inicijalno ažuriranje
    updateQueueStats();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(statsInterval);
    };
  }, []);

  // useEffect za slušanje ažuriranja zaposlenih iz Admin Panel-a
  useEffect(() => {
    const handleEmployeeUpdated = (data) => {
      console.log('🔄 Employee updated event received:', data);
      // Ažuriraj employeesDB sa novim podacima
      if (data.employee) {
        setEmployeesDB(prev => {
          const existingIndex = prev.findIndex(emp => emp.id === data.employee.id);
          if (existingIndex !== -1) {
            // Ažuriraj postojećeg zaposlenog
            const updated = [...prev];
            updated[existingIndex] = data.employee;
            return updated;
          } else {
            // Dodaj novog zaposlenog
            return [...prev, data.employee];
          }
        });
      }
    };

    const unsubscribeEmployeeUpdated = eventBus.subscribe(EVENTS.EMPLOYEE_UPDATED, handleEmployeeUpdated);

    return () => {
      unsubscribeEmployeeUpdated();
    };
  }, []);



  const handleExcelUpload = (data) => {
    // Process uploaded Excel data
    console.log('Excel data uploaded:', data);
    // Here you would process the Excel data and update the state
  };

  // Funkcije za filtriranje materijala (optimizovane sa useMemo)
  const getFilteredMaterials = useMemo(() => {
    if (!searchTerm.trim()) {
      return materials;
    }
    return materials.filter(material =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [materials, searchTerm]);

  const getFilteredMaterialsDB = useMemo(() => {
    if (!inventorySearchTerm.trim()) {
      return materialsDB;
    }
    return materialsDB.filter(material =>
      material.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
      material.category.toLowerCase().includes(inventorySearchTerm.toLowerCase())
    );
  }, [materialsDB, inventorySearchTerm]);

  // Funkcije za filtriranje podataka za export
  const getFilteredDataForExport = (department = '', employee = '') => {
    // Koristimo materialsDB umesto materials za konzistentnost
    let filteredMaterials = [...materialsDB];

    if (department) {
      filteredMaterials = filteredMaterials.filter(material => material.department === department);
    }

    if (employee) {
      filteredMaterials = filteredMaterials.filter(material => material.assignedTo === employee);
    }

    return filteredMaterials;
  };

  // Funkcija za export po odeljenju
  const exportByDepartment = async (department) => {
    const filteredData = getFilteredDataForExport(department, '');
    await exportToExcel(filteredData, `Materijali_${department}_${currentMonthPeriod.from.getMonth() + 1}_${currentMonthPeriod.from.getFullYear()}`);
  };

  // Funkcija za export po radniku
  const exportByEmployee = async (employee) => {
    const filteredData = getFilteredDataForExport('', employee);
    await exportToExcel(filteredData, `Materijali_${employee}_${currentMonthPeriod.from.getMonth() + 1}_${currentMonthPeriod.from.getFullYear()}`);
  };

  // Funkcija za export svih podataka
  const exportAllData = async () => {
    await exportToExcel(materials, `Svi_Materijali_${currentMonthPeriod.from.getMonth() + 1}_${currentMonthPeriod.from.getFullYear()}`);
  };

  const handleAddMaterial = async (newMaterial) => {
    console.log('🔍 Dodavanje materijala:', newMaterial);

    try {
      setIsLoading(true);
      setApiError(null);

      // Prvo ažuriramo stanje u magacinu (materialsDB) preko API-ja
      const existingMaterial = materialsDB.find(
        material => material.name.toLowerCase() === newMaterial.name.toLowerCase() &&
                   material.category === newMaterial.category
      );

      if (existingMaterial) {
        // Materijal već postoji - povećavamo količinu na stanju
        const updatedMaterial = {
          ...existingMaterial,
          stockQuantity: (existingMaterial?.stockQuantity || 0) + newMaterial.stockQuantity
        };
        
        console.log(`🔍 Povećavam stanje za "${existingMaterial?.name}" sa ${existingMaterial?.stockQuantity || 0} na ${updatedMaterial.stockQuantity}`);
        
        // Ažuriram preko API-ja
        await materialsAPI.update(existingMaterial.id, updatedMaterial);
        
        // Ažuriram lokalni state
        setMaterialsDB(prev => {
          const updated = prev.map(m => 
            m.id === existingMaterial.id ? updatedMaterial : m
          );
          console.log('🔍 AdminDashboard: materialsDB updated in handleAddMaterial (existing), new length:', updated.length);
          console.log('🔍 AdminDashboard: Updated material:', updatedMaterial);
          return updated;
        });
        
        // Emituj event za admin panel
        eventBus.emit(EVENTS.MATERIAL_UPDATED, {
          material: updatedMaterial,
          timestamp: new Date().toISOString()
        });
      } else {
        // Novi materijal - dodajemo ga u magacin preko API-ja
        const newMaterialForDB = {
          category: newMaterial.category,
          name: newMaterial.name,
          stockQuantity: newMaterial.stockQuantity,
          unit: newMaterial.unit,
          minStock: newMaterial.minStock || Math.max(1, Math.floor(newMaterial.stockQuantity * 0.2)) // 20% od početne količine kao minimalno
        };
        
        console.log(`🔍 Dodajem novi materijal "${newMaterial.name}" u magacin sa stanjem ${newMaterial.stockQuantity}`);
        
        // Dodajem preko API-ja
        const createdMaterial = await materialsAPI.create(newMaterialForDB);
        
        // Ažuriram lokalni state
        setMaterialsDB(prev => {
          const updated = [...prev, createdMaterial];
          console.log('🔍 App.js: materialsDB updated in handleAddMaterial, new length:', updated.length);
          console.log('🔍 App.js: New material added:', createdMaterial);
          console.log('🔍 App.js: All materialsDB items:', updated.map(m => ({ id: m.id, name: m.name, created_at: m.created_at })));
          return updated;
        });
        
        // Emituj event za admin panel
        console.log('🚨🚨🚨 App.js: EMITTING MATERIAL_CREATED EVENT! 🚨🚨🚨');
        console.log('🔍 App.js: Event data:', createdMaterial);
        console.log('🔍 App.js: Event timestamp:', new Date().toISOString());
        eventBus.emit(EVENTS.MATERIAL_CREATED, {
          material: createdMaterial,
          timestamp: new Date().toISOString()
        });
        console.log('🚨🚨🚨 App.js: MATERIAL_CREATED EVENT EMITTED! 🚨🚨🚨');
      }

    // Sada dodajemo/ažuriramo materijal u listu za praćenje potrošnje
    setMaterials(prev => {
      // Proveravamo da li već postoji isti materijal (po nazivu, kategoriji, odeljenju i zaduženom)
      const existingMaterialIndex = prev.findIndex(material =>
        material.name.toLowerCase() === newMaterial.name.toLowerCase() &&
        material.category === newMaterial.category &&
        material.department === newMaterial.department &&
        material.assignedTo === newMaterial.assignedTo
      );

      let updatedMaterials;

      if (existingMaterialIndex !== -1) {
        // Materijal već postoji - dodajemo količinu na postojeći datum
        updatedMaterials = prev.map((material, index) => {
          if (index === existingMaterialIndex) {
            const currentDate = new Date().toLocaleDateString('sr-RS').split('.').slice(0, 2).join('.');
            const updatedQuantities = {
              ...material.quantities,
              [currentDate]: (material.quantities[currentDate] || 0) + newMaterial.stockQuantity
            };
            const newTotal = Object.values(updatedQuantities).reduce((sum, qty) => sum + qty, 0);

            console.log(`🔍 Dodajem ${newMaterial.stockQuantity} komada na postojeći materijal "${material.name}" za datum ${currentDate}`);
            return {
              ...material,
              quantities: updatedQuantities,
              total: newTotal,
              assignmentDate: currentDate
            };
          }
          return material;
        });
      } else {
        // Novi materijal - kreiramo novi unos
        const currentDate = new Date().toLocaleDateString('sr-RS').split('.').slice(0, 2).join('.');
        const material = {
          ...newMaterial,
          id: Date.now(),
          quantities: {},
          total: newMaterial.stockQuantity,
          assignmentDate: currentDate
        };

        // Initialize quantities for all dates
        const dates = generateDatesForMonth(selectedMonth, selectedYear);
        dates.forEach(date => {
          material.quantities[date] = date === currentDate ? newMaterial.stockQuantity : 0;
        });

        updatedMaterials = [...prev, material];
        console.log(`🔍 Kreiram novi unos za materijal "${newMaterial.name}" sa ${newMaterial.stockQuantity} komada`);
      }

      // Čuvam ažurirane materijale u localStorage
      saveMaterialsToLocalStorage(updatedMaterials);
      return updatedMaterials;
    });

    setShowAddForm(false);
    console.log('✓ Materijal uspešno dodat/ažuriran!');
    
    } catch (error) {
      console.error('❌ Greška pri dodavanju materijala:', error);
      setApiError(`Greška pri dodavanju materijala: ${error.message}`);
      alert(`Greška pri dodavanju materijala: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcija za zaduženje materijala
  const handleMaterialAssignment = async (assignment) => {
    console.log('🔍 ====== POČETAK handleMaterialAssignment ======');
    console.log('🔍 Assignment objekat:', assignment);
    
    if (!assignment) {
      console.log('🔍 ERROR: Assignment je undefined!');
      return;
    }
    
    const { materialId, quantity, date, material, employee } = assignment;
    
    console.log('🔍 handleMaterialAssignment pozvan sa:', { materialId, quantity, date, material, employee });
    console.log('🔍 Trenutno materials state PRE:', materials);
    console.log('🔍 Date format:', date);
    console.log('🔍 Trenutni datum:', new Date().getDate().toString().padStart(2, '0') + '.' + (new Date().getMonth() + 1).toString().padStart(2, '0') + '.');
    
    try {
      setIsLoading(true);
      setApiError(null);
      
      // Ažuriram količinu na stanju preko API-ja
      const materialToUpdate = materialsDB.find(m => m.id === materialId);
      if (materialToUpdate) {
        const newStockQuantity = Math.max(0, (materialToUpdate?.stockQuantity || 0) - quantity);
        console.log(`🔍 Smanjujem stanje za "${materialToUpdate?.name}" sa ${materialToUpdate?.stockQuantity || 0} na ${newStockQuantity}`);
        
        const updatedMaterial = {
          ...materialToUpdate,
          stockQuantity: newStockQuantity
        };
        
        // Ažuriram preko API-ja
        await materialsAPI.update(materialId, updatedMaterial);
        
        // Ažuriram lokalni state
        setMaterialsDB(prev => {
          const updated = prev.map(m => 
            m.id === materialId ? updatedMaterial : m
          );
          console.log('🔍 AdminDashboard: materialsDB updated in handleMaterialAssignment, new length:', updated.length);
          return updated;
        });
      }

      // Kreiram zaduženje u bazi
      const assignmentData = {
        material_id: materialId,
        employee_id: employee.id,
        quantity: quantity,
        date: new Date().toISOString()
      };
      
      await assignmentsAPI.create(assignmentData);
      console.log('✅ Zaduženje kreirano u bazi:', assignmentData);

    // Dodajem zaduženje u materijale
    setMaterials(prev => {
      console.log('🔍 setMaterials prev:', prev);
      
      const existingMaterial = prev.find(m => m.id === materialId);
      console.log('🔍 existingMaterial:', existingMaterial);
      console.log('🔍 Tražim ID:', materialId, 'Tip:', typeof materialId);
      
      let updatedMaterials;
      
      if (existingMaterial) {
        // Ažuriram postojeći materijal
        const updatedQuantities = {
          ...existingMaterial.quantities,
          [date]: (existingMaterial.quantities[date] || 0) + quantity
        };
        
        const newTotal = Object.values(updatedQuantities).reduce((sum, qty) => sum + qty, 0);
        
        console.log('🔍 Ažuriram postojeći materijal:', { updatedQuantities, newTotal });
        console.log('🔍 Novi quantities za datum', date, ':', updatedQuantities[date]);
        
        updatedMaterials = prev.map(m => {
          if (m.id === materialId) {
            return {
              ...m,
              quantities: updatedQuantities,
              total: newTotal,
              department: employee.department,
              assignedTo: employee.name
            };
          }
          return m;
        });
        
        console.log('🔍 Updated materials:', updatedMaterials);
        console.log('🔍 Updated materials length:', updatedMaterials.length);
        console.log('🔍 Updated materials prvi:', updatedMaterials[0]);
      } else {
        // Kreiram novi materijal u sistemu
        const newMaterial = {
          id: materialId,
          category: material.category,
          name: material.name,
          department: employee.department,
          assignedTo: employee.name,
          assignmentDate: new Date().toLocaleDateString('sr-RS'),
          quantities: { [date]: quantity },
          total: quantity
        };
        
        console.log('🔍 Kreiram novi materijal:', newMaterial);
        
        updatedMaterials = [...prev, newMaterial];
      }
      
      // Čuvam ažurirane materijale u localStorage
      saveMaterialsToLocalStorage(updatedMaterials);
      
      return updatedMaterials;
    });

    // Prikazujem potvrdu
    alert(`Uspešno zadužen materijal: ${material.name} - ${quantity} ${material.unit} za ${employee.name}`);
    
    console.log('🔍 Nakon zaduženja, materials state će biti ažuriran');
    
    // Emituj event za trenutno ažuriranje Admin Panel-a
    eventBus.emit(EVENTS.ASSIGNMENT_CREATED, {
      assignment: {
        materialId,
        quantity,
        date,
        material,
        employee
      },
      timestamp: new Date().toISOString()
    });
    
    eventBus.emit(EVENTS.INVENTORY_UPDATED, {
      materialId,
      newStockQuantity: materialToUpdate ? Math.max(0, (materialToUpdate?.stockQuantity || 0) - quantity) : 0,
      timestamp: new Date().toISOString()
    });
    
    eventBus.emit(EVENTS.ADMIN_REFRESH_NEEDED, {
      reason: 'assignment_created',
      timestamp: new Date().toISOString()
    });
    
    setShowAssignmentForm(false);
    
    // Automatski prebacujem na početnu tab da korisnik vidi ažuriranje
    setActiveTab('dashboard');
    
    // Dodajem console.log da vidim da li se state stvarno ažurira
    console.log('🔍 Trenutno materials state NAKON zaduženja:', materials);
    
    // Osvežavam sve podatke da se ažuriraju i zaduženja
    await refreshData();
    
    } catch (error) {
      console.error('❌ Greška pri zaduženju materijala:', error);
      setApiError(`Greška pri zaduženju materijala: ${error.message}`);
      alert(`Greška pri zaduženju materijala: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcija za editovanje materijala
  const handleEditMaterial = async (updatedMaterial) => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      // Ažuriram materijal preko API-ja
      await materialsAPI.update(updatedMaterial.id, updatedMaterial);
      
      // Ažuriram lokalni state
      setMaterials(prev => {
        const updatedMaterials = prev.map(material => 
          material.id === updatedMaterial.id ? updatedMaterial : material
        );
        
        // Čuvam ažurirane materijale u localStorage
        saveMaterialsToLocalStorage(updatedMaterials);
        
        return updatedMaterials;
      });
      
      alert(`Materijal "${updatedMaterial.name}" je uspešno izmenjen!`);
      
      // Automatski prebacujem na početnu tab da korisnik vidi ažuriranje
      setActiveTab('dashboard');
      
    } catch (error) {
      console.error('❌ Greška pri editovanju materijala:', error);
      setApiError(`Greška pri editovanju materijala: ${error.message}`);
      alert(`Greška pri editovanju materijala: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcija za brisanje materijala
  const handleDeleteMaterial = async (materialId) => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      // Brisem materijal preko API-ja
      await materialsAPI.delete(materialId);
      
      // Uklanjam iz lokalnog state-a
      setMaterialsDB(prev => prev.filter(m => m.id !== materialId));
      setMaterials(prev => prev.filter(m => m.id !== materialId));
      
      // Emituj event za admin panel
      eventBus.emit(EVENTS.MATERIAL_DELETED, {
        materialId: materialId,
        timestamp: new Date().toISOString()
      });
      
      alert('Materijal je uspešno obrisan!');
      
    } catch (error) {
      console.error('❌ Greška pri brisanju materijala:', error);
      setApiError(`Greška pri brisanju materijala: ${error.message}`);
      alert(`Greška pri brisanju materijala: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcija za osvežavanje podataka iz API-ja
  const refreshData = async () => {
    console.log('🔍 refreshData called - ažuriram sve podatke iz admin dashboard-a');
    console.log('🔍 refreshData: Current materialsDB length before refresh:', materialsDB.length);
    try {
      setIsLoading(true);
      setApiError(null);
      console.log('🔄 Osvežavam podatke iz API-ja...');
      
      // Učitavam materijale iz API-ja
      const materialsData = await loadDataWithFallback(
        () => materialsAPI.getAll(),
        fallbackMaterials
      );
      setMaterialsDB(materialsData);
      console.log('✅ Materijali osveženi:', materialsData.length);
      
      // Učitavam zaposlene iz API-ja
      const employeesData = await loadDataWithFallback(
        () => employeesAPI.getAll(),
        fallbackEmployees
      );
      setEmployeesDB(employeesData);
      console.log('✅ Zaposleni osveženi:', employeesData.length);
      
      // Učitavam zaduženja iz API-ja
      const assignmentsData = await loadDataWithFallback(
        () => assignmentsAPI.getAll(),
        []
      );
      setAssignments(assignmentsData);
      console.log('✅ Zaduženja osvežena:', assignmentsData.length);
      
      // Generisanje materijala za dashboard na osnovu zaduženja
      const processedMaterials = processAssignmentsToMaterials(assignmentsData, materialsData, employeesData);
      setMaterials(processedMaterials);
      console.log('✅ Materijali za dashboard osveženi:', processedMaterials.length);
      
      // Ažuriram dashboard statistike
      try {
        const dashboardInfo = await getDatabaseInfo(currentMonthPeriod);
        console.log('🔄 Dashboard statistike ažurirane:', dashboardInfo);
        
        // Emituj event za ažuriranje dashboard statistika
        eventBus.emit(EVENTS.DATA_SYNC_NEEDED, {
          reason: 'manual_refresh',
          timestamp: new Date().toISOString(),
          materialsCount: materialsData.length,
          employeesCount: employeesData.length,
          assignmentsCount: assignmentsData.length,
          dashboardInfo: dashboardInfo
        });
      } catch (error) {
        console.error('❌ Greška pri ažuriranju dashboard statistika:', error);
        // Emituj event bez dashboard info
        eventBus.emit(EVENTS.DATA_SYNC_NEEDED, {
          reason: 'manual_refresh',
          timestamp: new Date().toISOString(),
          materialsCount: materialsData.length,
          employeesCount: employeesData.length,
          assignmentsCount: assignmentsData.length
        });
      }
      
      // Postavljam vreme poslednjeg osvežavanja
      setLastRefreshTime(new Date());
      
    } catch (error) {
      console.error('❌ Greška pri osvežavanju podataka:', error);
      setApiError(`Greška pri osvežavanju podataka: ${error.message}`);
    } finally {
      setIsLoading(false);
      console.log('🔍 refreshData: Finished - materialsDB length after refresh:', materialsDB.length);
      console.log('🔍 refreshData: All materialsDB items after refresh:', materialsDB.map(m => ({ id: m.id, name: m.name, created_at: m.created_at })));
    }
  };

  // Funkcija za automatsko osvežavanje podataka
  const autoRefreshData = async () => {
    try {
      console.log('🔄 Automatsko osvežavanje podataka...');
      
      // Učitavam materijale iz API-ja (bez loading state-a)
      const materialsData = await loadDataWithFallback(
        () => materialsAPI.getAll(),
        fallbackMaterials
      );
      setMaterialsDB(materialsData);
      
      // Učitavam zaposlene iz API-ja (bez loading state-a)
      const employeesData = await loadDataWithFallback(
        () => employeesAPI.getAll(),
        fallbackEmployees
      );
      setEmployeesDB(employeesData);
      
      // Učitavam zaduženja iz API-ja (bez loading state-a)
      const assignmentsData = await loadDataWithFallback(
        () => assignmentsAPI.getAll(),
        []
      );
      setAssignments(assignmentsData);
      
      // Generisanje materijala za dashboard na osnovu zaduženja
      const processedMaterials = processAssignmentsToMaterials(assignmentsData, materialsData, employeesData);
      setMaterials(processedMaterials);
      
      // Ažuriram dashboard statistike
      try {
        const dashboardInfo = await getDatabaseInfo(currentMonthPeriod);
        console.log('🔄 Dashboard statistike ažurirane:', dashboardInfo);
        
        // Emituj event za ažuriranje dashboard statistika
        eventBus.emit(EVENTS.DATA_SYNC_NEEDED, {
          reason: 'auto_refresh',
          timestamp: new Date().toISOString(),
          materialsCount: materialsData.length,
          employeesCount: employeesData.length,
          assignmentsCount: assignmentsData.length,
          dashboardInfo: dashboardInfo
        });
      } catch (error) {
        console.error('❌ Greška pri ažuriranju dashboard statistika:', error);
        // Emituj event bez dashboard info
        eventBus.emit(EVENTS.DATA_SYNC_NEEDED, {
          reason: 'auto_refresh',
          timestamp: new Date().toISOString(),
          materialsCount: materialsData.length,
          employeesCount: employeesData.length,
          assignmentsCount: assignmentsData.length
        });
      }
      
      // Postavljam vreme poslednjeg osvežavanja
      setLastRefreshTime(new Date());
      console.log('✅ Automatsko osvežavanje završeno');
      
    } catch (error) {
      console.error('❌ Greška pri automatskom osvežavanju:', error);
      // Ne prikazujemo error korisniku za automatsko osvežavanje
    }
  };

  // Funkcija za promenu tabova (optimizovana sa useCallback)
  const handleTabChange = useCallback((tabId) => {
    console.log('🔍 handleTabChange pozvan sa tabId:', tabId);
    console.log('🔍 Trenutno activeTab:', activeTab);
    setActiveTab(tabId);
    console.log('🔍 Postavljam activeTab na:', tabId);
  }, [activeTab]);

  // Funkcija za export Excel
  const exportToExcel = async (data = materials, fileName = null) => {
    console.log('🔍 Export Excel funkcija pozvana sa podacima:', data?.length || 0);
    console.log('📊 Data type:', Array.isArray(data) ? 'Array' : typeof data);
    console.log('📋 Sample data:', data?.slice(0, 2)?.map(m => ({
      id: m?.id,
      name: m?.name,
      category: m?.category,
      stockQuantity: m?.stockQuantity,
      hasStockQuantity: typeof m?.stockQuantity !== 'undefined',
      total: m?.total,
      hasTotal: typeof m?.total !== 'undefined'
    })));

    try {
      // Kreiram workbook i worksheet
      const workbook = XLSX.utils.book_new();

      // Podaci za export
      const exportData = [];

      // Dodajem logo i header informacije
      exportData.push(['']); // Prazan red
      exportData.push(['ENGINES MR - SISTEM ZA PRAĆENJE POTROŠNOG MATERIJALA']);
      exportData.push(['']); // Prazan red
      exportData.push(['Izveštaj generisan:', new Date().toLocaleString('sr-RS')]);
      exportData.push(['Period:', `${selectedMonth}/${selectedYear}`]);
      if (exportDepartment) exportData.push(['Odeljenje:', exportDepartment]);
      if (exportEmployee) exportData.push(['Radnik:', exportEmployee]);
      exportData.push(['']); // Prazan red
      exportData.push(['']); // Prazan red

      // Dodajem header red
      const headerRow = [
        'Kategorija',
        'Naziv Materijala',
        'Odeljenje',
        'Zadužen',
        ...getDatesForCurrentMonth(),
        'UKUPNO'
      ];
      exportData.push(headerRow);

      // Dodajem podatke za svaki materijal
      data.forEach(material => {
        const row = [
          material.category,
          material.name,
          material.department || 'N/A',
          material.assignedTo || 'N/A',
          ...getDatesForCurrentMonth().map(date => material.quantities[date] || 0),
          material.total
        ];
        exportData.push(row);
      });

      // Dodajem prazne redove za bolje formatiranje
      exportData.push(['']);
      exportData.push(['']);

      // Dodajem total redove ako nisu filtrirani
      if (!exportDepartment && !exportEmployee) {
        const categoryTotals = categories.map(category => {
          const total = getTotalForCategory(category);
          return [
            category,
            'UKUPNO ' + category,
            '',
            '',
            ...getDatesForCurrentMonth().map(date => getTotalForDate(date)),
            total
          ];
        });
        exportData.push(...categoryTotals);

        exportData.push(['']);

        // Dodajem overall total
        const overallTotal = [
          'UKUPNO SVE KATEGORIJE',
          '',
          '',
          '',
          ...getDatesForCurrentMonth().map(date => getTotalForDate(date)),
          getOverallTotal()
        ];
        exportData.push(overallTotal);
      }

      // Kreiram worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(exportData);

      // Podešavanje širine kolona za A4 format
      const columnWidths = [
        { wch: 20 }, // Kategorija
        { wch: 35 }, // Naziv Materijala
        { wch: 15 }, // Odeljenje
        { wch: 20 }, // Zadužen
        ...getDatesForCurrentMonth().map(() => ({ wch: 12 })), // Datumi
        { wch: 15 }  // UKUPNO
      ];
      worksheet['!cols'] = columnWidths;

      // Podešavanje za štampanje na A4
      worksheet['!margins'] = {
        left: 0.5,
        right: 0.5,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3
      };

      // Dodajem worksheet u workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Potrošni Materijal');

      // Generišem Excel buffer
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Koristi Save As dialog
      const result = await saveAsWorkflow(
        excelBuffer, 
        currentMonthPeriod, 
        'xlsx',
        [
          {
            name: 'Excel Files',
            extensions: ['xlsx', 'xls']
          }
        ]
      );
      
      if (result.success) {
        showToast(result.message, 'success');
        console.log('🔍 Excel fajl uspešno exportovan:', result.filePath);
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('🔍 Greška pri export-u Excel fajla:', error);
      alert('Došlo je do greške pri export-u Excel fajla. Pokušajte ponovo.');
    }
  };

  const handleQuantityChange = (materialId, date, value) => {
    console.log('🔍 ====== POČETAK handleQuantityChange ======');
    console.log('🔍 materialId:', materialId, 'date:', date, 'value:', value);
    console.log('🔍 Trenutno materials state PRE:', materials);
    
    // Računam razliku u količini za ažuriranje magacina
    const currentMaterial = materials.find(m => m.id === materialId);
    const oldQuantity = currentMaterial ? (currentMaterial.quantities[date] || 0) : 0;
    const newQuantity = Number(value) || 0;
    const quantityDifference = newQuantity - oldQuantity;
    
    console.log('🔍 Razlika u količini:', { oldQuantity, newQuantity, quantityDifference });
    
    // Ažuriram materijale (početna strana)
    setMaterials(prev => {
      const updatedMaterials = prev.map(material => {
        if (material.id === materialId) {
          console.log('🔍 Ažuriram materijal:', material.name);
          const newQuantities = { ...material.quantities, [date]: newQuantity };
          const newTotal = Object.values(newQuantities).reduce((sum, qty) => sum + qty, 0);
          console.log('🔍 Novi quantities:', newQuantities);
          console.log('🔍 Novi total:', newTotal);
          return {
            ...material,
            quantities: newQuantities,
            total: newTotal
          };
        }
        return material;
      });
      
      // Čuvam ažurirane materijale u localStorage
      saveMaterialsToLocalStorage(updatedMaterials);
      
      return updatedMaterials;
    });
    
    // Ažuriram stanje u magacinu
    if (quantityDifference !== 0) {
      setMaterialsDB(prev => {
        const updatedMaterialsDB = prev.map(material => {
          if (material.id === materialId) {
            const newStockQuantity = (material?.stockQuantity || 0) - quantityDifference;
            console.log('🔍 Ažuriram magacin:', { 
              name: material.name, 
              oldStock: material?.stockQuantity || 0, 
              newStock: newStockQuantity,
              difference: quantityDifference
            });
            return {
              ...material,
              stockQuantity: Math.max(0, newStockQuantity) // Ne može biti negativno
            };
          }
          return material;
        });
        
        // Čuvam ažurirano stanje magacina u localStorage
        saveMaterialsDBToLocalStorage(updatedMaterialsDB);
        
        return updatedMaterialsDB;
      });
    }
    
    console.log('🔍 ====== KRAJ handleQuantityChange ======');
  };

  // Funkcija za čuvanje materijala u localStorage
  const saveMaterialsToLocalStorage = (materialsToSave) => {
    try {
      localStorage.setItem('potrosniMaterijal', JSON.stringify(materialsToSave));
      console.log('🔍 Materijali sačuvani u localStorage:', materialsToSave);
    } catch (error) {
      console.error('🔍 Greška pri čuvanju u localStorage:', error);
    }
  };

  // Funkcija za čuvanje stanja magacina u localStorage
  const saveMaterialsDBToLocalStorage = (materialsDBToSave) => {
    try {
      localStorage.setItem('materialsDB', JSON.stringify(materialsDBToSave));
      console.log('🔍 Stanje magacina sačuvano u localStorage:', materialsDBToSave);
    } catch (error) {
      console.error('🔍 Greška pri čuvanju stanja magacina u localStorage:', error);
    }
  };

  const generateDatesForMonth = (month, year) => {
    const dates = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const formattedDate = `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.`;
        dates.push(formattedDate);
      }
    }
    
    return dates;
  };

  const getDatesForCurrentMonth = () => {
    return generateDatesForMonth(
      currentMonthPeriod.from.getMonth() + 1,
      currentMonthPeriod.from.getFullYear()
    );
  };

  const getTotalForCategory = (category) => {
    return materials
      .filter(material => material.category === category)
      .reduce((sum, material) => {
        // Filtriramo količine samo za trenutni period
        const periodQuantities = Object.keys(material.quantities || {})
          .filter(date => {
            const dateObj = new Date(date);
            return dateObj >= currentMonthPeriod.from && dateObj <= currentMonthPeriod.to;
          })
          .reduce((sum, date) => sum + (material.quantities[date] || 0), 0);
        return sum + periodQuantities;
      }, 0);
  };

  const getTotalForDate = (date) => {
    // Proveravamo da li datum pripada trenutnom periodu
    const dateObj = new Date(date);
    if (dateObj < currentMonthPeriod.from || dateObj > currentMonthPeriod.to) {
      return 0;
    }

    return materials.reduce((sum, material) => sum + (material.quantities[date] || 0), 0);
  };

  const getOverallTotal = () => {
    return materials.reduce((sum, material) => sum + material.total, 0);
  };

  // Funkcija za računanje broja materijala sa niskim stanjem
  const getLowStockCount = () => {
    return materialsDB.filter(material =>
      (material?.stockQuantity || 0) <= (material?.minStock || 0)
    ).length;
  };

  return (
    <div className="App">


      <Header
        onLogoClick={() => setActiveTab('dashboard')}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        lowStockCount={getLowStockCount()}
        currentMonth={currentMonth}
        currentYear={currentYear}
        onMonthChange={handleMonthChange}
      />

      <div className="container">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <StatsOverview 
              totalMaterials={materials.length}
              totalCategories={categories.length}
              overallTotal={getOverallTotal()}
              selectedMonth={currentMonthPeriod.from.getMonth() + 1}
              selectedYear={currentMonthPeriod.from.getFullYear()}
              currentPeriod={currentMonthPeriod}
            />



            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Pregled Potrošnog Materijala - {currentMonthPeriod.label}</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '250px' }}>
                    <Search size={20} style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6b7280',
                      pointerEvents: 'none'
                    }} />
                    <input
                      type="text"
                      placeholder="Pretraži materijale..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                        border: '2px solid #4b5563',
                        borderRadius: '8px',
                        background: '#1f2937',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                      onBlur={(e) => e.target.style.borderColor = '#4b5563'}
                    />
                  </div>

                  {/* Refresh dugme */}
                  <button
                    onClick={refreshData}
                    disabled={isLoading}
                    className={`refresh-button ${isLoading ? 'loading' : ''}`}
                    title="Osveži podatke iz baze"
                  >
                    {isLoading ? (
                      <Loader2 className="refresh-icon" size={20} />
                    ) : (
                      <RefreshCw className="refresh-icon" size={20} />
                    )}
                    <span className="loading-text">
                      {isLoading ? 'Osvežavam...' : 'Osveži'}
                    </span>
                  </button>

                  {/* Auto-refresh toggle */}
                  <button
                    onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                    style={{
                      background: autoRefreshEnabled ? '#dc2626' : '#059669',
                      border: `2px solid ${autoRefreshEnabled ? '#991b1b' : '#047857'}`,
                      color: '#ffffff',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}
                    title={autoRefreshEnabled ? 'Isključi automatsko osvežavanje' : 'Uključi automatsko osvežavanje'}
                  >
                    {autoRefreshEnabled ? '🔄 ON' : '⏸️ OFF'}
                  </button>

                  {/* Status automatskog osvežavanja */}
                  {lastRefreshTime && (
                    <div style={{
                      background: '#374151',
                      border: '1px solid #4b5563',
                      color: '#9ca3af',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>🕐</span>
                      <span>Poslednje: {lastRefreshTime.toLocaleTimeString('sr-RS')}</span>
                    </div>
                  )}

                  {/* Offline status indikator */}
                  {isOffline && (
                    <div style={{
                      background: '#dc2626',
                      border: '2px solid #991b1b',
                      color: '#ffffff',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      animation: 'pulse 2s infinite'
                    }}>
                      <span>📡</span>
                      <span>Offline</span>
                    </div>
                  )}

                  {/* Offline queue status */}
                  {offlineQueueStats.total > 0 && (
                    <div style={{
                      background: '#f59e0b',
                      border: '2px solid #d97706',
                      color: '#ffffff',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}
                    title={`Offline queue: ${offlineQueueStats.pending} pending, ${offlineQueueStats.failed} failed`}
                    onClick={() => alert(`Offline Queue Status:\n\nPending: ${offlineQueueStats.pending}\nFailed: ${offlineQueueStats.failed}\nTotal: ${offlineQueueStats.total}`)}
                    >
                      <span>📝</span>
                      <span>{offlineQueueStats.total}</span>
                    </div>
                  )}

                </div>
              </div>

              {/* Loading i Error States */}
              {isLoading && (
                <div style={{
                  background: '#1e40af',
                  border: '2px solid #3b82f6',
                  color: '#ffffff',
                  padding: '2rem',
                  borderRadius: '12px',
                  marginBottom: '2rem',
                  textAlign: 'center',
                  fontSize: '1.1rem'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #ffffff',
                      borderTop: '4px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto'
                    }}></div>
                  </div>
                  Učitavam podatke iz baze...
                </div>
              )}

              {apiError && (
                <div style={{
                  background: '#dc2626',
                  border: '2px solid #991b1b',
                  color: '#ffffff',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <AlertTriangle size={24} style={{ color: '#ffffff' }} />
                  <div>
                    <strong>Greška pri učitavanju podataka:</strong> {apiError}
                    <br />
                    <small>Koriste se fallback podaci. Proverite da li je backend server pokrenut.</small>
                  </div>
                </div>
              )}

              <div className="materials-table">
                <MaterialsTable
                  materials={getFilteredMaterials}
                  dates={getDatesForCurrentMonth()}
                  onQuantityChange={handleQuantityChange}
                  getTotalForCategory={getTotalForCategory}
                  getTotalForDate={getTotalForDate}
                  onEditMaterial={handleEditMaterial}
                  onDeleteMaterial={handleDeleteMaterial}
                />
              </div>
            </div>
          </>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="card">


            {/* Warning header za nisko stanje */}
            {getLowStockCount() > 0 && (
              <div style={{
                background: '#dc2626',
                border: '2px solid #991b1b',
                color: '#ffffff',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '1rem'
              }}>
                <AlertTriangle size={24} style={{ color: '#ffffff', flexShrink: 0 }} />
                <div>
                  <strong>Upozorenje!</strong> {getLowStockCount()} materijala ima nisko stanje i zahteva hitnu nabavku.
                  <br />
                  <small>Materijali sa niskim stanjem su označeni crvenom pozadinom.</small>
                </div>
              </div>
            )}
            
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Kategorija</th>
                    <th>Naziv Materijala</th>
                    <th>Stanje</th>
                    <th>Jedinica</th>
                    <th>Minimalno Stanje</th>
                    <th>Status</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredMaterialsDB.map(material => (
                    <tr key={material.id} className="inventory-row" style={{
                      background: (material?.stockQuantity || 0) <= (material?.minStock || 0) ? '#7f1d1d' : '#1e293b',
                      border: (material?.stockQuantity || 0) <= (material?.minStock || 0) ? '3px solid #dc2626 !important' : '1px solid #4b5563',
                      boxShadow: (material?.stockQuantity || 0) <= (material?.minStock || 0) ? '0 0 12px rgba(220, 38, 38, 0.6) !important' : 'none',
                      borderRadius: (material?.stockQuantity || 0) <= (material?.minStock || 0) ? '4px' : '0px'
                    }}>
                      <td>{material.category}</td>
                      <td>{material.name}</td>
                      <td style={{ 
                        fontWeight: '600',
                        color: (material?.stockQuantity || 0) <= (material?.minStock || 0) ? '#fca5a5' : '#86efac'
                      }}>
                        {(material?.stockQuantity || 0) > 0 ? (material?.stockQuantity || 0) : '/'}
                      </td>
                      <td>{material.unit}</td>
                      <td>{material?.minStock || '/'}</td>
                      <td>
                        {(material?.stockQuantity || 0) <= (material?.minStock || 0) ? (
                          <span style={{ color: '#fca5a5', fontWeight: '600' }}>PORUČI</span>
                        ) : (
                          <span style={{ color: '#86efac', fontWeight: '600' }}>OK</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          onClick={() => handleDeleteMaterial(material.id)}
                          title="Obriši materijal"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="card">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #374151'
            }}>
              <h2 style={{ 
                color: '#ffffff', 
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: '600'
              }}>
                Upravljanje Materijalom
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddForm(!showAddForm)}
                  style={{
                    background: '#374151',
                    border: '2px solid #4b5563',
                    color: '#d1d5db'
                  }}
                >
                  <Plus size={20} />
                  Dodaj Materijal
                </button>
                <button 
                  className="btn"
                  onClick={() => {
                    console.log('🔍 ====== POČETAK onClick dugmeta ======');
                    console.log('🔍 Kliknuo sam Zaduži Materijal dugme');
                    console.log('🔍 Trenutno showAssignmentForm:', showAssignmentForm);
                    console.log('🔍 Postavljam showAssignmentForm na:', !showAssignmentForm);
                    setShowAssignmentForm(!showAssignmentForm);
                    console.log('🔍 ====== KRAJ onClick dugmeta ======');
                  }}
                >
                  <UserCheck size={20} />
                  Zaduži Materijal
                </button>
              </div>
            </div>

            {showAddForm && (
              <AddMaterialForm 
                categories={categories}
                departments={departments}
                users={users}
                materialsDB={materialsDB}
                onAdd={handleAddMaterial}
                onCancel={() => setShowAddForm(false)}
              />
            )}

            {showAssignmentForm && (
              <MaterialAssignmentForm 
                materialsDB={materialsDB}
                employeesDB={employeesDB}
                onAssign={(assignment) => {
                  console.log('🔍 MaterialAssignmentForm onAssign pozvan sa:', assignment);
                  handleMaterialAssignment(assignment);
                }}
                onCancel={() => setShowAssignmentForm(false)}
                currentDate={new Date().getDate().toString().padStart(2, '0') + '.' + (new Date().getMonth() + 1).toString().padStart(2, '0') + '.'}
              />
            )}
          </div>
        )}


        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="card">
            <h2>
              <Database size={28} style={{ marginRight: '0.75rem', verticalAlign: 'middle', color: '#ffffff' }} />
              Izvoz Podataka i Izveštaji
            </h2>

            {/* Detaljni Export Sistem */}
            <DetailedExport
              materials={getFilteredMaterialsDB}
              employees={employeesDB}
              currentPeriod={currentMonthPeriod}
              assignments={materials}
              getFilteredDataForExport={getFilteredDataForExport}
            />

            {/* Word Export opcije */}
            <div style={{
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                color: '#ffffff',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FileText size={24} style={{ color: '#7c3aed' }} />
                Word Izvoz
              </h3>
              
              <WordExporter 
                materials={getFilteredMaterials}
                materialsDB={getFilteredMaterialsDB}
                selectedMonth={currentMonthPeriod.from.getMonth() + 1}
                selectedYear={currentMonthPeriod.from.getFullYear()}
                currentPeriod={currentMonthPeriod}
                totalMaterials={materials.length}
                totalCategories={categories.length}
                overallTotal={getOverallTotal()}
                getDatesForCurrentMonth={getDatesForCurrentMonth}
                getTotalForCategory={getTotalForCategory}
                getTotalForDate={getTotalForDate}
                exportDepartment={exportDepartment}
                exportEmployee={exportEmployee}
                getFilteredDataForExport={getFilteredDataForExport}
                setExportDepartment={setExportDepartment}
                setExportEmployee={setExportEmployee}
                exportFormat={exportFormat}
              />
            </div>

            {/* Excel Export opcije */}
            <div style={{
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                color: '#ffffff',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FileSpreadsheet size={24} style={{ color: '#059669' }} />
                Excel Izvoz
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <button
                  className="btn"
                  onClick={exportAllData}
                  style={{
                    background: '#059669',
                    border: '2px solid #047857',
                    color: '#ffffff',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  <FileSpreadsheet size={24} />
                  <div style={{ marginTop: '0.5rem' }}>Export Svi Podaci</div>
                  <small style={{ fontWeight: '400', opacity: '0.9' }}>
                    Kompletan izveštaj
                  </small>
                </button>

                <button
                  className="btn"
                  onClick={() => exportToExcel(getFilteredMaterials, `Potrosni_Materijal_${currentMonthPeriod.from.getMonth() + 1}_${currentMonthPeriod.from.getFullYear()}`)}
                  style={{
                    background: '#7c3aed',
                    border: '2px solid #6d28d9',
                    color: '#ffffff',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  <FileSpreadsheet size={24} />
                  <div style={{ marginTop: '0.5rem' }}>Export Potrošnja</div>
                  <small style={{ fontWeight: '400', opacity: '0.9' }}>
                    Po datumima
                  </small>
                </button>

                <button
                  className="btn"
                  onClick={() => exportToExcel(getFilteredMaterialsDB, `Magacin_${currentMonthPeriod.from.getMonth() + 1}_${currentMonthPeriod.from.getFullYear()}`)}
                  style={{
                    background: '#dc2626',
                    border: '2px solid #b91c1c',
                    color: '#ffffff',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  <FileSpreadsheet size={24} />
                  <div style={{ marginTop: '0.5rem' }}>Export Magacin</div>
                  <small style={{ fontWeight: '400', opacity: '0.9' }}>
                    Stanje zaliha
                  </small>
                </button>
              </div>
            </div>



            {/* Dodatne opcije */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem'
            }}>
              <div style={{
                background: '#1f2937',
                border: '2px solid #374151',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
                  <Upload size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#10b981' }} />
                  Import Podataka
                </h4>
                <ExcelUploader onUpload={handleExcelUpload} />
              </div>

              <div style={{
                background: '#1f2937',
                border: '2px solid #374151',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
                  <FileDown size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#f59e0b' }} />
                  Šabloni
                </h4>
                <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                  Preuzmite šablone za unos podataka:
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn"
                    style={{
                      background: '#374151',
                      border: '2px solid #4b5563',
                      color: '#d1d5db',
                      padding: '0.75rem 1.25rem',
                      fontSize: '0.9rem',
                      borderRadius: '8px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FileSpreadsheet size={18} />
                    Šablon Materijali
                  </button>
                  <button
                    className="btn"
                    style={{
                      background: '#374151',
                      border: '2px solid #4b5563',
                      color: '#d1d5db',
                      padding: '0.75rem 1.25rem',
                      fontSize: '0.9rem',
                      borderRadius: '8px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FileSpreadsheet size={18} />
                    Šablon Zaposleni
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <FantasticalCalendar 
            selectedPeriod={currentMonthPeriod}
            onPeriodChange={handleMonthChange}
            onDateSelect={(date) => {
              console.log('📅 Izabran datum:', date);
            }}
            assignments={materials}
          />
        )}

        {/* Admin Panel Tab */}
        {activeTab === 'admin' && (
          <div>
            {console.log('🚨🚨🚨 APP.JS: Rendering SimpleAdminPanel! 🚨🚨🚨')}
            {console.log('🔍 APP.JS: materialsDB length:', materialsDB.length)}
            {console.log('🔍 APP.JS: assignments length:', assignments.length)}
            <SimpleAdminPanel
              currentPeriod={currentMonthPeriod}
              materials={materials}
              materialsDB={materialsDB}
              employeesDB={employeesDB}
              assignments={assignments}
              onRefresh={refreshData}
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
