import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText, Download, Filter, Search, Calendar, User, Package, Loader2, Eye, ChevronDown } from 'lucide-react';
import { materialsAPI, employeesAPI } from '../services/api';
import { saveAsWorkflow, showToast } from '../services/fileUtils';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, WidthType } from 'docx';

const DetailedExport = ({
  materials,
  employees,
  currentPeriod,
  assignments,
  getFilteredDataForExport
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [exportData, setExportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showFilters, setShowFilters] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    employeeId: '',
    materialId: '',
    category: '',
    startDate: currentPeriod ? currentPeriod.from.toISOString().split('T')[0] : '',
    endDate: currentPeriod ? currentPeriod.to.toISOString().split('T')[0] : '',
    department: ''
  });

  // Dropdown states
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

  // Load initial data
  useEffect(() => {
    if (assignments && assignments.length > 0) {
      setExportData(assignments);
      setFilteredData(assignments);
    }
  }, [assignments]);

  // Update filters when currentPeriod changes
  useEffect(() => {
    if (currentPeriod) {
      setFilters(prev => ({
        ...prev,
        startDate: currentPeriod.from.toISOString().split('T')[0],
        endDate: currentPeriod.to.toISOString().split('T')[0]
      }));
    }
  }, [currentPeriod]);

  // Apply filters
  useEffect(() => {
    let filtered = [...exportData];

    // Broj aktivnih filtera
    const activeFilters = Object.values(filters).filter(value => value && value !== '').length;
    
    // Ako ima manje od 2 aktivna filtera, prikaži sve podatke
    if (activeFilters < 2) {
      setFilteredData(filtered);
      return;
    }

    if (filters.employeeId) {
      filtered = filtered.filter(item => item.employee_id === parseInt(filters.employeeId));
    }

    if (filters.materialId) {
      filtered = filtered.filter(item => item.material_id === parseInt(filters.materialId));
    }

    if (filters.category) {
      const materialsInCategory = materials.filter(mat => mat.category === filters.category);
      const materialIds = materialsInCategory.map(mat => mat.id);
      filtered = filtered.filter(item => materialIds.includes(item.material_id));
    }

    if (filters.startDate) {
      filtered = filtered.filter(item => item.date >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(item => item.date <= filters.endDate);
    }

    if (filters.department) {
      const employeesInDept = employees.filter(emp => emp.department === filters.department);
      const employeeIds = employeesInDept.map(emp => emp.id);
      filtered = filtered.filter(item => employeeIds.includes(item.employee_id));
    }

    setFilteredData(filtered);
  }, [filters, exportData, employees, materials]);

  // Get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Nepoznat';
  };

  // Get employee department by ID
  const getEmployeeDepartment = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.department : '';
  };

  // Get material name by ID
  const getMaterialName = (materialId) => {
    const material = materials.find(mat => mat.id === materialId);
    return material ? material.name : 'Nepoznat';
  };

  // Get material category by ID
  const getMaterialCategory = (materialId) => {
    const material = materials.find(mat => mat.id === materialId);
    return material ? material.category : '';
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle "Select All" option
  const handleSelectAll = (field) => {
    setFilters(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      employeeId: '',
      materialId: '',
      category: '',
      startDate: currentPeriod ? currentPeriod.from.toISOString().split('T')[0] : '',
      endDate: currentPeriod ? currentPeriod.to.toISOString().split('T')[0] : '',
      department: ''
    });
  };

  // Export to Excel
  const exportToExcel = async () => {
    console.log('Excel export started, exportData:', exportData.length, 'filteredData:', filteredData.length);
    
    if (exportData.length === 0) {
      showToast('Nema podataka za export', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Use filteredData if available, otherwise use exportData
      const dataToExport = filteredData.length > 0 ? filteredData : exportData;
      console.log('Data to export:', dataToExport.length, 'items');
      
      // Prepare data for export
      const exportRows = dataToExport.map(item => ({
        'Datum': item.date,
        'Zaposleni': getEmployeeName(item.employee_id),
        'Odeljenje': getEmployeeDepartment(item.employee_id),
        'Materijal': getMaterialName(item.material_id),
        'Kategorija': getMaterialCategory(item.material_id),
        'Količina': item.quantity,
        'Jedinica': item.unit || 'kom'
      }));

      // Add summary row
      const totalQuantity = dataToExport.reduce((sum, item) => sum + item.quantity, 0);
      exportRows.push({
        'Datum': '',
        'Zaposleni': '',
        'Odeljenje': '',
        'Materijal': 'UKUPNO',
        'Kategorija': '',
        'Količina': totalQuantity,
        'Jedinica': ''
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportRows);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 12 }, // Datum
        { wch: 25 }, // Zaposleni
        { wch: 20 }, // Odeljenje
        { wch: 35 }, // Materijal
        { wch: 20 }, // Kategorija
        { wch: 12 }, // Količina
        { wch: 10 }  // Jedinica
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Detaljni Izveštaj');

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Use Save As dialog
      console.log('Calling saveAsWorkflow with buffer size:', excelBuffer.length);
      const result = await saveAsWorkflow(
        excelBuffer,
        currentPeriod,
        'xlsx',
        [
          {
            name: 'Excel Files',
            extensions: ['xlsx', 'xls']
          }
        ]
      );

      console.log('SaveAsWorkflow result:', result);
      if (result.success) {
        showToast(`Detaljni izveštaj exportovan: ${dataToExport.length} transakcija`, 'success');
      } else {
        showToast(`Greška: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Greška pri export-u:', error);
      showToast('Greška pri export-u detaljnog izveštaja', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Export to Word
  const exportToWord = async () => {
    console.log('Word export started, exportData:', exportData.length, 'filteredData:', filteredData.length);
    
    if (exportData.length === 0) {
      showToast('Nema podataka za export', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Use filteredData if available, otherwise use exportData
      const dataToExport = filteredData.length > 0 ? filteredData : exportData;
      console.log('Data to export:', dataToExport.length, 'items');
      
      // Calculate totals
      const totalQuantity = dataToExport.reduce((sum, item) => sum + item.quantity, 0);
      const uniqueEmployees = new Set(dataToExport.map(item => item.employee_id)).size;
      const uniqueMaterials = new Set(dataToExport.map(item => item.material_id)).size;

      // Create Word document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Title
            new Paragraph({
              text: "Detaljni Izveštaj - Statistika po Zaposlenima",
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            
            // Empty line
            new Paragraph({ text: "" }),
            
            // Statistics section
            new Paragraph({
              text: "Pregled Statistika",
              heading: HeadingLevel.HEADING_2,
            }),
            
            // Statistics table
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: "Ukupno transakcija" })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: dataToExport.length.toString() })],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: "Ukupna količina" })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: totalQuantity.toString() })],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: "Broj zaposlenih" })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: uniqueEmployees.toString() })],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: "Broj materijala" })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: uniqueMaterials.toString() })],
                    }),
                  ],
                }),
              ],
            }),
            
            // Empty line
            new Paragraph({ text: "" }),
            
            // Details section
            new Paragraph({
              text: "Detaljni Podaci",
              heading: HeadingLevel.HEADING_2,
            }),
            
            // Details table
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                // Header row
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: "Datum" })] }),
                    new TableCell({ children: [new Paragraph({ text: "Zaposleni" })] }),
                    new TableCell({ children: [new Paragraph({ text: "Odeljenje" })] }),
                    new TableCell({ children: [new Paragraph({ text: "Materijal" })] }),
                    new TableCell({ children: [new Paragraph({ text: "Kategorija" })] }),
                    new TableCell({ children: [new Paragraph({ text: "Količina" })] }),
                  ],
                }),
                // Data rows
                ...dataToExport.map(item => 
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ text: new Date(item.date).toLocaleDateString('sr-RS') })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: getEmployeeName(item.employee_id) })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: getEmployeeDepartment(item.employee_id) })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: getMaterialName(item.material_id) })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: getMaterialCategory(item.material_id) })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: `${item.quantity} ${item.unit || 'kom'}` })],
                      }),
                    ],
                  })
                ),
                // Total row
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: "UKUPNO" })] }),
                    new TableCell({ children: [new Paragraph({ text: "" })] }),
                    new TableCell({ children: [new Paragraph({ text: "" })] }),
                    new TableCell({ children: [new Paragraph({ text: "" })] }),
                    new TableCell({ children: [new Paragraph({ text: "" })] }),
                    new TableCell({
                      children: [new Paragraph({ text: totalQuantity.toString() })],
                    }),
                  ],
                }),
              ],
            }),
            
            // Empty line
            new Paragraph({ text: "" }),
            
            // Footer
            new Paragraph({
              text: `Izveštaj generisan: ${new Date().toLocaleDateString('sr-RS')} ${new Date().toLocaleTimeString('sr-RS')}`,
              alignment: AlignmentType.CENTER,
            }),
          ],
        }],
      });

      // Generate Word buffer
      console.log('Generating Word buffer...');
      const buffer = await Packer.toBuffer(doc);
      console.log('Word buffer generated, size:', buffer.length);

      // Use Save As dialog for Word
      console.log('Calling saveAsWorkflow for Word...');
      const result = await saveAsWorkflow(
        buffer,
        currentPeriod,
        'docx',
        [
          {
            name: 'Word Documents',
            extensions: ['docx', 'doc']
          }
        ]
      );

      console.log('SaveAsWorkflow result for Word:', result);
      if (result.success) {
        showToast(`Detaljni izveštaj exportovan u Word: ${dataToExport.length} transakcija`, 'success');
      } else {
        showToast(`Greška: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Greška pri export-u u Word:', error);
      showToast('Greška pri export-u detaljnog izveštaja u Word', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique departments
  const getUniqueDepartments = () => {
    return [...new Set(employees.map(emp => emp.department).filter(dept => dept))];
  };

  const getUniqueCategories = () => {
    return [...new Set(materials.map(mat => mat.category).filter(cat => cat))];
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#1f2937', border: '2px solid #374151', borderRadius: '12px', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
          <Filter size={24} style={{ marginRight: '0.75rem', verticalAlign: 'middle' }} />
          Detaljni Export - Statistika po Zaposlenima
        </h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            background: '#374151',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            color: '#d1d5db',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Filter size={16} />
          {showFilters ? 'Sakrij Filtere' : 'Prikaži Filtere'}
          <ChevronDown size={16} style={{
            transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }} />
        </button>
      </div>

      {showFilters && (
        <div style={{
          background: '#1f2937',
          border: '2px solid #374151',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {/* Employee Filter */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <User size={14} style={{ marginRight: '0.5rem' }} />
                Zaposleni
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Izaberi zaposlenog..."
                  value={filters.employeeId ? getEmployeeName(parseInt(filters.employeeId)) : ''}
                  onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#374151',
                    border: '2px solid #4b5563',
                    borderRadius: '8px',
                    color: '#d1d5db',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                />
                {showEmployeeDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#374151',
                    border: '2px solid #4b5563',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    marginTop: '0.25rem'
                  }}>
                    <div
                      onClick={() => {
                        handleSelectAll('employeeId');
                        setShowEmployeeDropdown(false);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        color: '#10b981',
                        borderBottom: '1px solid #4b5563',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        backgroundColor: '#064e3b'
                      }}
                    >
                      ✓ Izaberi sve
                    </div>
                    <div
                      onClick={() => {
                        handleFilterChange('employeeId', '');
                        setShowEmployeeDropdown(false);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        color: '#d1d5db',
                        borderBottom: '1px solid #4b5563',
                        fontSize: '0.9rem'
                      }}
                    >
                      Svi zaposleni
                    </div>
                    {employees.map(employee => (
                      <div
                        key={employee.id}
                        onClick={() => {
                          handleFilterChange('employeeId', employee.id.toString());
                          setShowEmployeeDropdown(false);
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          color: '#d1d5db',
                          borderBottom: '1px solid #4b5563',
                          fontSize: '0.9rem',
                          hover: { backgroundColor: '#4b5563' }
                        }}
                      >
                        {employee.name}
                        <span style={{ color: '#6b7280', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                          ({employee.department})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <Package size={14} style={{ marginRight: '0.5rem' }} />
                Kategorija
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Izaberi kategoriju..."
                  value={filters.category}
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#374151',
                    border: '2px solid #4b5563',
                    borderRadius: '8px',
                    color: '#d1d5db',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                />
                {showCategoryDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#374151',
                    border: '2px solid #4b5563',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    marginTop: '0.25rem'
                  }}>
                    <div
                      onClick={() => {
                        handleSelectAll('category');
                        setShowCategoryDropdown(false);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        color: '#10b981',
                        borderBottom: '1px solid #4b5563',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        backgroundColor: '#064e3b'
                      }}
                    >
                      ✓ Izaberi sve
                    </div>
                    <div
                      onClick={() => {
                        handleFilterChange('category', '');
                        setShowCategoryDropdown(false);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        color: '#d1d5db',
                        borderBottom: '1px solid #4b5563',
                        fontSize: '0.9rem'
                      }}
                    >
                      Sve kategorije
                    </div>
                    {getUniqueCategories().map(cat => (
                      <div
                        key={cat}
                        onClick={() => {
                          handleFilterChange('category', cat);
                          setShowCategoryDropdown(false);
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          color: '#d1d5db',
                          borderBottom: '1px solid #4b5563',
                          fontSize: '0.9rem'
                        }}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Material Filter */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <Package size={14} style={{ marginRight: '0.5rem' }} />
                Materijal
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Izaberi materijal..."
                  value={filters.materialId ? getMaterialName(parseInt(filters.materialId)) : ''}
                  onClick={() => setShowMaterialDropdown(!showMaterialDropdown)}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#374151',
                    border: '2px solid #4b5563',
                    borderRadius: '8px',
                    color: '#d1d5db',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                />
                {showMaterialDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#374151',
                    border: '2px solid #4b5563',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    marginTop: '0.25rem'
                  }}>
                    <div
                      onClick={() => {
                        handleSelectAll('materialId');
                        setShowMaterialDropdown(false);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        color: '#10b981',
                        borderBottom: '1px solid #4b5563',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        backgroundColor: '#064e3b'
                      }}
                    >
                      ✓ Izaberi sve
                    </div>
                    <div
                      onClick={() => {
                        handleFilterChange('materialId', '');
                        setShowMaterialDropdown(false);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        color: '#d1d5db',
                        borderBottom: '1px solid #4b5563',
                        fontSize: '0.9rem'
                      }}
                    >
                      Svi materijali
                    </div>
                    {materials.map(material => (
                      <div
                        key={material.id}
                        onClick={() => {
                          handleFilterChange('materialId', material.id.toString());
                          setShowMaterialDropdown(false);
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          color: '#d1d5db',
                          borderBottom: '1px solid #4b5563',
                          fontSize: '0.9rem'
                        }}
                      >
                        {material.name}
                        <span style={{ color: '#6b7280', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                          ({material.category})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Department Filter */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <User size={14} style={{ marginRight: '0.5rem' }} />
                Odeljenje
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Izaberi odeljenje..."
                  value={filters.department}
                  onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#374151',
                    border: '2px solid #4b5563',
                    borderRadius: '8px',
                    color: '#d1d5db',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                />
                {showDepartmentDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#374151',
                    border: '2px solid #4b5563',
                    borderRadius: '8px',
                    zIndex: 1000,
                    marginTop: '0.25rem'
                  }}>
                    <div
                      onClick={() => {
                        handleSelectAll('department');
                        setShowDepartmentDropdown(false);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        color: '#10b981',
                        borderBottom: '1px solid #4b5563',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        backgroundColor: '#064e3b'
                      }}
                    >
                      ✓ Izaberi sve
                    </div>
                    <div
                      onClick={() => {
                        handleFilterChange('department', '');
                        setShowDepartmentDropdown(false);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        color: '#d1d5db',
                        borderBottom: '1px solid #4b5563',
                        fontSize: '0.9rem'
                      }}
                    >
                      Sva odeljenja
                    </div>
                    {getUniqueDepartments().map(dept => (
                      <div
                        key={dept}
                        onClick={() => {
                          handleFilterChange('department', dept);
                          setShowDepartmentDropdown(false);
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          cursor: 'pointer',
                          color: '#d1d5db',
                          borderBottom: '1px solid #4b5563',
                          fontSize: '0.9rem'
                        }}
                      >
                        {dept}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <Calendar size={14} style={{ marginRight: '0.5rem' }} />
                Od datuma
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#374151',
                  border: '2px solid #4b5563',
                  borderRadius: '8px',
                  color: '#d1d5db',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <Calendar size={14} style={{ marginRight: '0.5rem' }} />
                Do datuma
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#374151',
                  border: '2px solid #4b5563',
                  borderRadius: '8px',
                  color: '#d1d5db',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={clearFilters}
              style={{
                background: '#6b7280',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Filter size={16} />
              Očisti filtere
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div style={{
        background: '#1f2937',
        border: '2px solid #374151',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {filteredData.length}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Transakcija</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {filteredData.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Ukupna količina</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {new Set(filteredData.map(item => item.employee_id)).size}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Zaposlenih</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {new Set(filteredData.map(item => item.material_id)).size}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Materijala</div>
          </div>
        </div>

        {/* Export Buttons */}
        <div style={{ textAlign: 'center' }}>
          {/* Debug info */}
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            background: '#1f2937', 
            border: '1px solid #374151', 
            borderRadius: '8px',
            color: '#10b981',
            fontSize: '0.9rem'
          }}>
            🔍 DEBUG: ExportData: {exportData.length}, FilteredData: {filteredData.length}, IsLoading: {isLoading.toString()}
          </div>
          
          {/* Info message */}
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            background: '#1f2937', 
            border: '1px solid #374151', 
            borderRadius: '8px',
            color: '#94a3b8',
            fontSize: '0.9rem'
          }}>
            💡 <strong>Tip:</strong> Izaberite minimum 2 filtera za precizniji export, ili ostavite prazno za sve podatke
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={exportToExcel}
              disabled={isLoading || exportData.length === 0}
              style={{
                background: exportData.length > 0 ? '#059669' : '#374151',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem 2rem',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: exportData.length > 0 ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease'
              }}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={20} />
              )}
              {isLoading ? 'Exportovanje...' : 'Exportuj u Excel'}
            </button>
            
            <button
              onClick={exportToWord}
              disabled={isLoading || exportData.length === 0}
              style={{
                background: exportData.length > 0 ? '#dc2626' : '#374151',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem 2rem',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: exportData.length > 0 ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease'
              }}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <FileText size={20} />
              )}
              {isLoading ? 'Exportovanje...' : 'Exportuj u Word'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Preview */}
      {filteredData.length > 0 && (
        <div style={{
          background: '#1f2937',
          border: '2px solid #374151',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>
            <Eye size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Pregled podataka ({filteredData.length} transakcija)
          </h4>

          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid #374151',
            borderRadius: '8px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#374151' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#d1d5db', fontSize: '0.9rem', borderBottom: '1px solid #4b5563' }}>Datum</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#d1d5db', fontSize: '0.9rem', borderBottom: '1px solid #4b5563' }}>Zaposleni</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#d1d5db', fontSize: '0.9rem', borderBottom: '1px solid #4b5563' }}>Materijal</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#d1d5db', fontSize: '0.9rem', borderBottom: '1px solid #4b5563' }}>Količina</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 10).map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #374151' }}>
                    <td style={{ padding: '0.75rem', color: '#d1d5db', fontSize: '0.9rem' }}>
                      {new Date(item.date).toLocaleDateString('sr-RS')}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#d1d5db', fontSize: '0.9rem' }}>
                      {getEmployeeName(item.employee_id)}
                      <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                        {getEmployeeDepartment(item.employee_id)}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#d1d5db', fontSize: '0.9rem' }}>
                      {getMaterialName(item.material_id)}
                      <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                        {getMaterialCategory(item.material_id)}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#d1d5db', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      {item.quantity} {item.unit || 'kom'}
                    </td>
                  </tr>
                ))}
                {filteredData.length > 10 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
                      ... i još {filteredData.length - 10} transakcija
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredData.length === 0 && exportData.length > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#6b7280',
          fontSize: '1.1rem'
        }}>
          Nema podataka koji odgovaraju izabranim filterima
        </div>
      )}

      {exportData.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#6b7280',
          fontSize: '1.1rem'
        }}>
          Nema podataka za prikaz
        </div>
      )}
    </div>
  );
};

export default DetailedExport;
