import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import MaterialsTable from './components/MaterialsTable';
import ExcelUploader from './components/ExcelUploader';
import AddMaterialForm from './components/AddMaterialForm';
import MaterialAssignmentForm from './components/MaterialAssignmentForm';
import EditMaterialForm from './components/EditMaterialForm';
import WordExporter from './components/WordExporter';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { Plus, FileSpreadsheet, FileText, UserCheck, AlertTriangle, Search, Target, Calendar, Building2, User, Download, Upload, FileDown, FileUp, Settings, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';

// Sample data arrays - premestam izvan komponente da ne bi se redefinisali pri svakom renderovanju
const sampleCategories = [
  'POTROSNI MATERIJAL',
  'ZASTITNA OPREMA', 
  'MESINGANE CETKE',
  'HIGIJENA',
  'AMBALAZA',
  'ALAT'
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

// Baza potrošnog materijala sa količinama na stanju
const materialsDatabase = [
    // POTROSNI MATERIJAL
    { id: 1, category: 'POTROSNI MATERIJAL', name: 'nitro razredjivac pentico', stockQuantity: 50, unit: 'kom', minStock: 10 },
    { id: 2, category: 'POTROSNI MATERIJAL', name: 'odmascivac forch eco 500ml', stockQuantity: 100, unit: 'kom', minStock: 20 },
    { id: 3, category: 'POTROSNI MATERIJAL', name: 'crni silikon DIHT MASA CRNA DIRKO 320C', stockQuantity: 25, unit: 'kom', minStock: 5 },
    { id: 4, category: 'POTROSNI MATERIJAL', name: 'nalepnice', stockQuantity: 1000, unit: 'kom', minStock: 100 },
    { id: 5, category: 'POTROSNI MATERIJAL', name: 'KARTICA KLIPNJACA', stockQuantity: 200, unit: 'kom', minStock: 50 },
    { id: 6, category: 'POTROSNI MATERIJAL', name: 'KARTICA BLOK', stockQuantity: 150, unit: 'kom', minStock: 30 },
    { id: 7, category: 'POTROSNI MATERIJAL', name: 'KARTICA RADILICA', stockQuantity: 120, unit: 'kom', minStock: 25 },
    { id: 8, category: 'POTROSNI MATERIJAL', name: 'KARTICA GLAVA', stockQuantity: 80, unit: 'kom', minStock: 15 },
    { id: 9, category: 'POTROSNI MATERIJAL', name: 'tocak fi 125 fiksni', stockQuantity: 15, unit: 'kom', minStock: 3 },
    { id: 10, category: 'POTROSNI MATERIJAL', name: 'wd 40 400ml sprej', stockQuantity: 30, unit: 'kom', minStock: 8 },
    { id: 11, category: 'POTROSNI MATERIJAL', name: 'CINK-ALUMINIJUM ZASTITNA BOJA SREBRNA hmt', stockQuantity: 40, unit: 'kom', minStock: 10 },
    { id: 12, category: 'POTROSNI MATERIJAL', name: 'sprej sivi ral 9006', stockQuantity: 35, unit: 'kom', minStock: 8 },
    { id: 13, category: 'POTROSNI MATERIJAL', name: 'crni sprej ral 9005', stockQuantity: 45, unit: 'kom', minStock: 10 },
    { id: 14, category: 'POTROSNI MATERIJAL', name: 'sprej 7016', stockQuantity: 25, unit: 'kom', minStock: 5 },
    { id: 15, category: 'POTROSNI MATERIJAL', name: 'nitro emajl crni', stockQuantity: 30, unit: 'kom', minStock: 8 },
    { id: 16, category: 'POTROSNI MATERIJAL', name: 'prasak ex-270 25kg', stockQuantity: 8, unit: 'kom', minStock: 2 },
    { id: 17, category: 'POTROSNI MATERIJAL', name: 'lepak k122 (lepak za cepove)', stockQuantity: 20, unit: 'kom', minStock: 5 },
    { id: 18, category: 'POTROSNI MATERIJAL', name: 'LEPAK K118 (LEPAK ZA NAVOJE)', stockQuantity: 15, unit: 'kom', minStock: 4 },
    { id: 19, category: 'POTROSNI MATERIJAL', name: 'smirgla 320 superflex platno', stockQuantity: 50, unit: 'kom', minStock: 10 },
    { id: 20, category: 'POTROSNI MATERIJAL', name: 'smirgla 220 superflex', stockQuantity: 40, unit: 'kom', minStock: 8 },
    
    // ZASTITNA OPREMA
    { id: 21, category: 'ZASTITNA OPREMA', name: 'rukavice radne', stockQuantity: 200, unit: 'par', minStock: 50 },
    { id: 22, category: 'ZASTITNA OPREMA', name: 'naočare zaštitne', stockQuantity: 30, unit: 'kom', minStock: 10 },
    { id: 23, category: 'ZASTITNA OPREMA', name: 'kaciga zaštitna', stockQuantity: 25, unit: 'kom', minStock: 5 },
    { id: 24, category: 'ZASTITNA OPREMA', name: 'maska za lice', stockQuantity: 150, unit: 'kom', minStock: 30 },
    { id: 25, category: 'ZASTITNA OPREMA', name: 'čizme radne', stockQuantity: 20, unit: 'par', minStock: 5 },
    
    // MESINGANE CETKE
    { id: 26, category: 'MESINGANE CETKE', name: 'cetka mesingana 2"', stockQuantity: 15, unit: 'kom', minStock: 3 },
    { id: 27, category: 'MESINGANE CETKE', name: 'cetka mesingana 1"', stockQuantity: 20, unit: 'kom', minStock: 5 },
    { id: 28, category: 'MESINGANE CETKE', name: 'cetka mesingana 3"', stockQuantity: 10, unit: 'kom', minStock: 2 },
    
    // HIGIJENA
    { id: 29, category: 'HIGIJENA', name: 'sapun za ruke', stockQuantity: 50, unit: 'kom', minStock: 10 },
    { id: 30, category: 'HIGIJENA', name: 'papir za ruke', stockQuantity: 100, unit: 'rola', minStock: 20 },
    { id: 31, category: 'HIGIJENA', name: 'dezinfekcija za ruke', stockQuantity: 25, unit: 'kom', minStock: 5 },
    
    // AMBALAZA
    { id: 32, category: 'AMBALAZA', name: 'kartonske kutije', stockQuantity: 200, unit: 'kom', minStock: 50 },
    { id: 33, category: 'AMBALAZA', name: 'folija stretch', stockQuantity: 30, unit: 'rola', minStock: 8 },
    { id: 34, category: 'AMBALAZA', name: 'selotejp', stockQuantity: 100, unit: 'kom', minStock: 20 },
    
    // ALAT
    { id: 35, category: 'ALAT', name: 'ključ 17', stockQuantity: 8, unit: 'kom', minStock: 2 },
    { id: 36, category: 'ALAT', name: 'ključ 19', stockQuantity: 6, unit: 'kom', minStock: 2 },
    { id: 37, category: 'ALAT', name: 'odvijač Philips', stockQuantity: 12, unit: 'kom', minStock: 3 },
    { id: 38, category: 'ALAT', name: 'čekić 1kg', stockQuantity: 5, unit: 'kom', minStock: 1 },
    { id: 39, category: 'ALAT', name: 'pinceta', stockQuantity: 15, unit: 'kom', minStock: 3 }
  ];

// Baza zaposlenih radnika
const employeesDatabase = [
  { id: 1, name: 'Marko Petrović', department: 'Proizvodnja', position: 'Proizvodni radnik', phone: '061-123-456' },
  { id: 2, name: 'Ana Jovanović', department: 'Proizvodnja', position: 'Proizvodni radnik', phone: '061-234-567' },
  { id: 3, name: 'Petar Nikolić', department: 'Održavanje', position: 'Mehaničar', phone: '061-345-678' },
  { id: 4, name: 'Marija Đorđević', department: 'Održavanje', position: 'Električar', phone: '061-456-789' },
  { id: 5, name: 'Stefan Stojanović', department: 'Kontrola kvaliteta', position: 'Kontrolor kvaliteta', phone: '061-567-890' },
  { id: 6, name: 'Jelena Marković', department: 'Kontrola kvaliteta', position: 'Kontrolor kvaliteta', phone: '061-678-901' },
  { id: 7, name: 'Dragan Simić', department: 'Logistika', position: 'Logističar', phone: '061-789-012' },
  { id: 8, name: 'Snežana Popović', department: 'Logistika', position: 'Skladištar', phone: '061-890-123' },
  { id: 9, name: 'Milan Đukić', department: 'Administracija', position: 'Administrativni radnik', phone: '061-901-234' },
  { id: 10, name: 'Jovana Stanković', department: 'IT Odeljenje', position: 'IT tehničar', phone: '061-012-345' },
  { id: 11, name: 'Perica Perić', department: 'Proizvodnja', position: 'Proizvodni radnik', phone: '061-111-222' },
  { id: 12, name: 'Mira Mirić', department: 'Održavanje', position: 'Mehaničar', phone: '061-222-333' },
  { id: 13, name: 'Zoran Zorić', department: 'Kontrola kvaliteta', position: 'Kontrolor kvaliteta', phone: '061-333-444' },
  { id: 14, name: 'Ljiljana Ljiljić', department: 'Logistika', position: 'Logističar', phone: '061-444-555' },
  { id: 15, name: 'Branko Brankić', department: 'Administracija', position: 'Administrativni radnik', phone: '061-555-666' }
];

function App() {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]); // Nova state varijabla
  const [users, setUsers] = useState([]); // Nova state varijabla
  const [materialsDB, setMaterialsDB] = useState([]); // Baza materijala
  const [employeesDB, setEmployeesDB] = useState([]); // Baza zaposlenih
  const [selectedMonth] = useState('08');
  const [selectedYear] = useState('2024');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false); // Forma za zaduženje
  const [activeTab, setActiveTab] = useState('dashboard'); // Aktivni tab
  const [searchTerm, setSearchTerm] = useState(''); // Pretraga za dashboard
  const [inventorySearchTerm, setInventorySearchTerm] = useState(''); // Pretraga za inventory
  const [exportDepartment, setExportDepartment] = useState(''); // Filter za export po odeljenju
  const [exportEmployee, setExportEmployee] = useState(''); // Filter za export po radniku
  const [exportFormat, setExportFormat] = useState('excel'); // Format za export (excel/word)

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
    setEmployeesDB(employeesDatabase);
    
    // Učitavam sačuvano stanje magacina iz localStorage
    const savedMaterialsDB = localStorage.getItem('materialsDB');
    if (savedMaterialsDB) {
      try {
        const parsedMaterialsDB = JSON.parse(savedMaterialsDB);
        console.log('🔍 Učitavam sačuvano stanje magacina iz localStorage:', parsedMaterialsDB);
        setMaterialsDB(parsedMaterialsDB);
      } catch (error) {
        console.error('🔍 Greška pri učitavanju stanja magacina iz localStorage:', error);
        setMaterialsDB(materialsDatabase);
      }
    } else {
      // Ako nema sačuvanih podataka, koristim sample podatke
      console.log('🔍 Nema sačuvanog stanja magacina, koristim sample podatke');
      setMaterialsDB(materialsDatabase);
    }
    
    // Učitavam sačuvane materijale iz localStorage
    const savedMaterials = localStorage.getItem('potrosniMaterijal');
    if (savedMaterials) {
      try {
        const parsedMaterials = JSON.parse(savedMaterials);
        console.log('🔍 Učitavam sačuvane materijale iz localStorage:', parsedMaterials);
        setMaterials(parsedMaterials);
      } catch (error) {
        console.error('🔍 Greška pri učitavanju iz localStorage:', error);
        setMaterials(sampleMaterials);
      }
    } else {
      // Ako nema sačuvanih podataka, koristim sample podatke
      console.log('🔍 Nema sačuvanih podataka, koristim sample podatke');
      setMaterials(sampleMaterials);
    }
  }, []); // Empty dependency array since these are static arrays



  const handleExcelUpload = (data) => {
    // Process uploaded Excel data
    console.log('Excel data uploaded:', data);
    // Here you would process the Excel data and update the state
  };

  // Funkcije za filtriranje materijala
  const getFilteredMaterials = () => {
    if (!searchTerm.trim()) {
      return materials;
    }
    return materials.filter(material =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredMaterialsDB = () => {
    if (!inventorySearchTerm.trim()) {
      return materialsDB;
    }
    return materialsDB.filter(material =>
      material.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
      material.category.toLowerCase().includes(inventorySearchTerm.toLowerCase())
    );
  };

  // Funkcije za filtriranje podataka za export
  const getFilteredDataForExport = (department = '', employee = '') => {
    let filteredMaterials = [...materials];

    if (department) {
      filteredMaterials = filteredMaterials.filter(material => material.department === department);
    }

    if (employee) {
      filteredMaterials = filteredMaterials.filter(material => material.assignedTo === employee);
    }

    return filteredMaterials;
  };

  // Funkcija za export po odeljenju
  const exportByDepartment = (department) => {
    const filteredData = getFilteredDataForExport(department, '');
    exportToExcel(filteredData, `Materijali_${department}_${selectedMonth}_${selectedYear}`);
  };

  // Funkcija za export po radniku
  const exportByEmployee = (employee) => {
    const filteredData = getFilteredDataForExport('', employee);
    exportToExcel(filteredData, `Materijali_${employee}_${selectedMonth}_${selectedYear}`);
  };

  // Funkcija za export svih podataka
  const exportAllData = () => {
    exportToExcel(materials, `Svi_Materijali_${selectedMonth}_${selectedYear}`);
  };

  const handleAddMaterial = (newMaterial) => {
    console.log('🔍 Dodavanje materijala:', newMaterial);

    // Prvo ažuriramo stanje u magacinu (materialsDB)
    setMaterialsDB(prevMaterialsDB => {
      const existingMaterialIndex = prevMaterialsDB.findIndex(
        material => material.name.toLowerCase() === newMaterial.name.toLowerCase() &&
                   material.category === newMaterial.category
      );

      let updatedMaterialsDB;

      if (existingMaterialIndex !== -1) {
        // Materijal već postoji - povećavamo količinu na stanju
        updatedMaterialsDB = prevMaterialsDB.map((material, index) => {
          if (index === existingMaterialIndex) {
            const newStockQuantity = material.stockQuantity + newMaterial.quantity;
            console.log(`🔍 Povećavam stanje za "${material.name}" sa ${material.stockQuantity} na ${newStockQuantity}`);
            return {
              ...material,
              stockQuantity: newStockQuantity
            };
          }
          return material;
        });
      } else {
        // Novi materijal - dodajemo ga u magacin sa početnim stanjem
        const newMaterialForDB = {
          id: Date.now(),
          category: newMaterial.category,
          name: newMaterial.name,
          stockQuantity: newMaterial.quantity,
          unit: newMaterial.unit,
          minStock: Math.max(1, Math.floor(newMaterial.quantity * 0.2)) // 20% od početne količine kao minimalno
        };
        updatedMaterialsDB = [...prevMaterialsDB, newMaterialForDB];
        console.log(`🔍 Dodajem novi materijal "${newMaterial.name}" u magacin sa stanjem ${newMaterial.quantity}`);
      }

      // Čuvam ažurirano stanje magacina u localStorage
      saveMaterialsDBToLocalStorage(updatedMaterialsDB);
      return updatedMaterialsDB;
    });

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
              [currentDate]: (material.quantities[currentDate] || 0) + newMaterial.quantity
            };
            const newTotal = Object.values(updatedQuantities).reduce((sum, qty) => sum + qty, 0);

            console.log(`🔍 Dodajem ${newMaterial.quantity} komada na postojeći materijal "${material.name}" za datum ${currentDate}`);
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
          total: newMaterial.quantity,
          assignmentDate: currentDate
        };

        // Initialize quantities for all dates
        const dates = generateDatesForMonth(selectedMonth, selectedYear);
        dates.forEach(date => {
          material.quantities[date] = date === currentDate ? newMaterial.quantity : 0;
        });

        updatedMaterials = [...prev, material];
        console.log(`🔍 Kreiram novi unos za materijal "${newMaterial.name}" sa ${newMaterial.quantity} komada`);
      }

      // Čuvam ažurirane materijale u localStorage
      saveMaterialsToLocalStorage(updatedMaterials);
      return updatedMaterials;
    });

    setShowAddForm(false);
    console.log('✓ Materijal uspešno dodat/ažuriran!');
  };

  // Funkcija za zaduženje materijala
  const handleMaterialAssignment = (assignment) => {
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
    
    // Ažuriram količinu na stanju
    setMaterialsDB(prev => {
      const updatedMaterialsDB = prev.map(m => {
        if (m.id === materialId) {
          const newStockQuantity = Math.max(0, m.stockQuantity - quantity);
          console.log(`🔍 Smanjujem stanje za "${m.name}" sa ${m.stockQuantity} na ${newStockQuantity}`);
          return {
            ...m,
            stockQuantity: newStockQuantity
          };
        }
        return m;
      });
      // Čuvam ažurirano stanje magacina u localStorage
      saveMaterialsDBToLocalStorage(updatedMaterialsDB);
      return updatedMaterialsDB;
    });

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
    
    setShowAssignmentForm(false);
    
    // Automatski prebacujem na početnu tab da korisnik vidi ažuriranje
    setActiveTab('dashboard');
    
    // Dodajem console.log da vidim da li se state stvarno ažurira
    console.log('🔍 Trenutno materials state NAKON zaduženja:', materials);
  };

  // Funkcija za editovanje materijala
  const handleEditMaterial = (updatedMaterial) => {
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
  };

  // Funkcija za promenu tabova
  const handleTabChange = (tabId) => {
    console.log('🔍 handleTabChange pozvan sa tabId:', tabId);
    console.log('🔍 Trenutno activeTab:', activeTab);
    setActiveTab(tabId);
    console.log('🔍 Postavljam activeTab na:', tabId);
  };

  // Funkcija za export Excel
  const exportToExcel = (data = materials, fileName = null) => {
    console.log('🔍 Export Excel funkcija pozvana sa podacima:', data?.length || 0);

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

      // Generišem ime fajla
      const finalFileName = fileName || `Potrosni_Materijal_${new Date().toLocaleDateString('sr-RS').replace(/\./g, '-')}.xlsx`;

      // Exportujem fajl
      XLSX.writeFile(workbook, fileName);

      console.log('🔍 Excel fajl uspešno exportovan:', finalFileName);
      alert(`Excel fajl "${finalFileName}" je uspešno preuzet!\n\nFajl je formatiran za štampanje na A4.`);

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
            const newStockQuantity = material.stockQuantity - quantityDifference;
            console.log('🔍 Ažuriram magacin:', { 
              name: material.name, 
              oldStock: material.stockQuantity, 
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
    return generateDatesForMonth(selectedMonth, selectedYear);
  };

  const getTotalForCategory = (category) => {
    return materials
      .filter(material => material.category === category)
      .reduce((sum, material) => sum + material.total, 0);
  };

  const getTotalForDate = (date) => {
    return materials.reduce((sum, material) => sum + (material.quantities[date] || 0), 0);
  };

  const getOverallTotal = () => {
    return materials.reduce((sum, material) => sum + material.total, 0);
  };

  // Funkcija za računanje broja materijala sa niskim stanjem
  const getLowStockCount = () => {
    return materialsDB.filter(material => material.stockQuantity <= material.minStock).length;
  };

  return (
    <div className="App">
      <Header 
        onLogoClick={() => setActiveTab('dashboard')}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        lowStockCount={getLowStockCount()}
      />
      
      <div className="container">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <StatsOverview 
              totalMaterials={materials.length}
              totalCategories={categories.length}
              overallTotal={getOverallTotal()}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />



            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Pregled Potrošnog Materijala - Avgust 2024</h2>
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

                </div>
              </div>
              <div className="materials-table">
                <MaterialsTable
                  materials={getFilteredMaterials()}
                  dates={getDatesForCurrentMonth()}
                  onQuantityChange={handleQuantityChange}
                  getTotalForCategory={getTotalForCategory}
                  getTotalForDate={getTotalForDate}
                  onEditMaterial={handleEditMaterial}
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
                  </tr>
                </thead>
                <tbody>
                  {getFilteredMaterialsDB().map(material => (
                    <tr key={material.id} className="inventory-row" style={{
                      background: material.stockQuantity <= material.minStock ? '#7f1d1d' : '#1e293b',
                      border: material.stockQuantity <= material.minStock ? '3px solid #dc2626 !important' : '1px solid #4b5563',
                      boxShadow: material.stockQuantity <= material.minStock ? '0 0 12px rgba(220, 38, 38, 0.6) !important' : 'none',
                      borderRadius: material.stockQuantity <= material.minStock ? '4px' : '0px'
                    }}>
                      <td>{material.category}</td>
                      <td>{material.name}</td>
                      <td style={{ 
                        fontWeight: '600',
                        color: material.stockQuantity <= material.minStock ? '#fca5a5' : '#86efac'
                      }}>
                        {material.stockQuantity}
                      </td>
                      <td>{material.unit}</td>
                      <td>{material.minStock}</td>
                      <td>
                        {material.stockQuantity <= material.minStock ? (
                          <span style={{ color: '#fca5a5', fontWeight: '600' }}>PORUČI</span>
                        ) : (
                          <span style={{ color: '#86efac', fontWeight: '600' }}>OK</span>
                        )}
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

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <motion.div 
            className="card"
            whileHover={{ 
              scale: 1.02,
              y: -5,
              boxShadow: "0 8px 25px rgba(220, 38, 38, 0.4)",
              border: '3px solid #dc2626',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              transition: { duration: 0.2 }
            }}
            style={{ cursor: 'pointer' }}
          >
            <h2>Izveštaji i Analiza</h2>
            <p>Ovde će biti implementirani detaljni izveštaji o potrošnji materijala.</p>
          </motion.div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="card">
            <h2>
              <Database size={28} style={{ marginRight: '0.75rem', verticalAlign: 'middle', color: '#ffffff' }} />
              Izvoz Podataka i Izveštaji
            </h2>

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
                materials={materials}
                materialsDB={materialsDB}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
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
                  onClick={() => exportToExcel(materials, `Potrosni_Materijal_${selectedMonth}_${selectedYear}`)}
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
                  onClick={() => exportToExcel(materialsDB, `Magacin_${selectedMonth}_${selectedYear}`)}
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

            {/* Napredni filteri za export */}
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
                <Target size={24} style={{ color: '#dc2626' }} />
                Napredni Export sa Filterima
              </h3>

              {/* Izbor formata za export */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                alignItems: 'center'
              }}>
                <span style={{ color: '#ffffff', fontWeight: '600' }}>Format export-a:</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn"
                    onClick={() => setExportFormat('excel')}
                    style={{
                      background: exportFormat === 'excel' ? '#059669' : '#374151',
                      border: `2px solid ${exportFormat === 'excel' ? '#047857' : '#4b5563'}`,
                      color: '#ffffff',
                      padding: '0.5rem 1rem',
                      fontWeight: '600'
                    }}
                  >
                    <FileSpreadsheet size={16} style={{ marginRight: '0.5rem' }} />
                    Excel
                  </button>
                  <button
                    className="btn"
                    onClick={() => setExportFormat('word')}
                    style={{
                      background: exportFormat === 'word' ? '#7c3aed' : '#374151',
                      border: `2px solid ${exportFormat === 'word' ? '#6d28d9' : '#4b5563'}`,
                      color: '#ffffff',
                      padding: '0.5rem 1rem',
                      fontWeight: '600'
                    }}
                  >
                    <FileText size={16} style={{ marginRight: '0.5rem' }} />
                    Word
                  </button>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div>
                  <label style={{
                    color: '#ffffff',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    <Calendar size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Izaberi Period
                  </label>
                  <DropdownButton
                    id="exportPeriod"
                    title={`${selectedMonth}/${selectedYear}`}
                    variant="outline-secondary"
                    style={{
                      width: '100%',
                      textAlign: 'left'
                    }}
                    className="custom-dropdown"
                  >
                    <Dropdown.Item onClick={() => {}}>
                      Trenutni period: {selectedMonth}/{selectedYear}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => {}}>
                      Svi periodi
                    </Dropdown.Item>
                  </DropdownButton>
                </div>

                <div>
                  <label style={{
                    color: '#ffffff',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    <Building2 size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Filtriraj po Odeljenju
                  </label>
                  <DropdownButton
                    id="exportDepartment"
                    title={exportDepartment || "Sva odeljenja"}
                    variant="outline-secondary"
                    style={{
                      width: '100%',
                      textAlign: 'left'
                    }}
                    className="custom-dropdown"
                  >
                    <Dropdown.Item
                      onClick={() => setExportDepartment('')}
                      style={{
                        background: '' === exportDepartment ? '#dc2626' : '#334155',
                        color: '' === exportDepartment ? '#ffffff' : '#e2e8f0',
                        border: 'none',
                        padding: '0.5rem 1rem'
                      }}
                    >
                      Sva odeljenja
                    </Dropdown.Item>
                    {[...new Set(materials.map(m => m.department))].map(dept => (
                      <Dropdown.Item
                        key={dept}
                        onClick={() => setExportDepartment(dept)}
                        style={{
                          background: dept === exportDepartment ? '#dc2626' : '#334155',
                          color: dept === exportDepartment ? '#ffffff' : '#e2e8f0',
                          border: 'none',
                          padding: '0.5rem 1rem'
                        }}
                      >
                        {dept}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </div>

                <div>
                  <label style={{
                    color: '#ffffff',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    <User size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Filtriraj po Radniku
                  </label>
                  <DropdownButton
                    id="exportEmployee"
                    title={exportEmployee || "Svi radnici"}
                    variant="outline-secondary"
                    style={{
                      width: '100%',
                      textAlign: 'left'
                    }}
                    className="custom-dropdown"
                  >
                    <Dropdown.Item
                      onClick={() => setExportEmployee('')}
                      style={{
                        background: '' === exportEmployee ? '#dc2626' : '#334155',
                        color: '' === exportEmployee ? '#ffffff' : '#e2e8f0',
                        border: 'none',
                        padding: '0.5rem 1rem'
                      }}
                    >
                      Svi radnici
                    </Dropdown.Item>
                    {[...new Set(materials.map(m => m.assignedTo))].map(employee => (
                      <Dropdown.Item
                        key={employee}
                        onClick={() => setExportEmployee(employee)}
                        style={{
                          background: employee === exportEmployee ? '#dc2626' : '#334155',
                          color: employee === exportEmployee ? '#ffffff' : '#e2e8f0',
                          border: 'none',
                          padding: '0.5rem 1rem'
                        }}
                      >
                        {employee}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </div>
              </div>

              {/* Dugmad za filtrirani export */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                {exportDepartment && (
                  <button
                    className="btn"
                    onClick={() => {
                      if (exportFormat === 'excel') {
                        exportByDepartment(exportDepartment);
                      } else {
                        // Word export za odeljenje
                        if (window.exportFilteredToWord) {
                          window.exportFilteredToWord('overview', exportDepartment, '');
                        }
                      }
                    }}
                    style={{
                      background: exportFormat === 'excel' ? '#dc2626' : '#7c3aed',
                      border: exportFormat === 'excel' ? '2px solid #b91c1c' : '2px solid #6d28d9',
                      color: '#ffffff',
                      padding: '0.75rem 1.5rem',
                      fontWeight: '600'
                    }}
                  >
                    {exportFormat === 'excel' ? <FileSpreadsheet size={20} /> : <FileText size={20} />}
                    Export: {exportDepartment} ({exportFormat === 'excel' ? 'Excel' : 'Word'})
                  </button>
                )}

                {exportEmployee && (
                  <button
                    className="btn"
                    onClick={() => {
                      if (exportFormat === 'excel') {
                        exportByEmployee(exportEmployee);
                      } else {
                        // Word export za radnika
                        if (window.exportFilteredToWord) {
                          window.exportFilteredToWord('overview', '', exportEmployee);
                        }
                      }
                    }}
                    style={{
                      background: exportFormat === 'excel' ? '#059669' : '#7c3aed',
                      border: exportFormat === 'excel' ? '2px solid #047857' : '2px solid #6d28d9',
                      color: '#ffffff',
                      padding: '0.75rem 1.5rem',
                      fontWeight: '600'
                    }}
                  >
                    {exportFormat === 'excel' ? <FileSpreadsheet size={20} /> : <FileText size={20} />}
                    Export: {exportEmployee} ({exportFormat === 'excel' ? 'Excel' : 'Word'})
                  </button>
                )}

                {(exportDepartment || exportEmployee) && (
                  <button
                    className="btn"
                    onClick={() => {
                      const filteredData = getFilteredDataForExport(exportDepartment, exportEmployee);
                      if (exportFormat === 'excel') {
                        exportToExcel(filteredData, `Materijali_${exportDepartment || 'Sva'}_${exportEmployee || 'Svi'}_${selectedMonth}_${selectedYear}`);
                      } else {
                        // Word export za filtrirane podatke
                        if (window.exportFilteredToWord) {
                          window.exportFilteredToWord('overview', exportDepartment, exportEmployee);
                        }
                      }
                    }}
                    style={{
                      background: exportFormat === 'excel' ? '#7c3aed' : '#dc2626',
                      border: exportFormat === 'excel' ? '2px solid #6d28d9' : '2px solid #b91c1c',
                      color: '#ffffff',
                      padding: '0.75rem 1.5rem',
                      fontWeight: '600'
                    }}
                  >
                    {exportFormat === 'excel' ? <FileSpreadsheet size={20} /> : <FileText size={20} />}
                    Export Filtrirano ({exportFormat === 'excel' ? 'Excel' : 'Word'})
                  </button>
                )}

                <div style={{
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  marginLeft: '1rem'
                }}>
                  {exportDepartment && exportEmployee ?
                    `Izabran period: ${selectedMonth}/${selectedYear} | Odeljenje: ${exportDepartment} | Radnik: ${exportEmployee}` :
                    exportDepartment ?
                    `Izabran period: ${selectedMonth}/${selectedYear} | Odeljenje: ${exportDepartment}` :
                    exportEmployee ?
                    `Izabran period: ${selectedMonth}/${selectedYear} | Radnik: ${exportEmployee}` :
                    `Izabran period: ${selectedMonth}/${selectedYear}`
                  }
                </div>
              </div>
            </div>

            {/* Dodatne opcije */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              <div style={{
                background: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <h4 style={{ color: '#ffffff', marginBottom: '1rem' }}>
                  <Upload size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  Import Podataka
                </h4>
                <ExcelUploader onUpload={handleExcelUpload} />
              </div>

              <div style={{
                background: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <h4 style={{ color: '#ffffff', marginBottom: '1rem' }}>
                  <FileDown size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  Šabloni
                </h4>
                <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                  Preuzmite šablone za unos podataka:
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn"
                    style={{
                      background: '#374151',
                      border: '2px solid #4b5563',
                      color: '#d1d5db',
                      padding: '0.5rem 1rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <FileSpreadsheet size={16} />
                    Šablon Materijali
                  </button>
                  <button
                    className="btn"
                    style={{
                      background: '#374151',
                      border: '2px solid #4b5563',
                      color: '#d1d5db',
                      padding: '0.5rem 1rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <FileSpreadsheet size={16} />
                    Šablon Zaposleni
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
