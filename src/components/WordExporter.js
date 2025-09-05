import React, { useState } from 'react';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { FileText, Loader2 } from 'lucide-react';
import { saveAsWorkflow, showToast } from '../services/fileUtils';


const WordExporter = ({ 
  materials, 
  materialsDB, 
  selectedMonth, 
  selectedYear, 
  currentPeriod,
  totalMaterials, 
  totalCategories, 
  overallTotal, 
  getDatesForCurrentMonth, 
  getTotalForCategory, 
  getTotalForDate, 
  exportDepartment, 
  exportEmployee, 
  getFilteredDataForExport, 
  setExportDepartment, 
  setExportEmployee, 
  exportFormat 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  // Funkcija za prikaz toast poruka
  const showToast = (message, type = 'success') => {
    setExportStatus({ message, type });
    setTimeout(() => setExportStatus(null), 5000);
  };

  const getMonthName = (month) => {
    const months = {
      '01': 'Januar', '02': 'Februar', '03': 'Mart', '04': 'April',
      '05': 'Maj', '06': 'Jun', '07': 'Jul', '08': 'Avgust',
      '09': 'Septembar', '10': 'Oktobar', '11': 'Novembar', '12': 'Decembar'
    };
    return months[month] || month;
  };

  // Funkcija koja može da se pozove izvana za napredni export
  const exportFilteredToWord = async (type = 'overview', department = '', employee = '') => {
    return exportToWord(type, department, employee);
  };

  // Expose funkciju globalno da može da se pozove iz App.js
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.exportFilteredToWord = exportFilteredToWord;
    }
  }, []);

  const exportToWord = async (type = 'overview', department = '', employee = '') => {
    setIsExporting(true);
    setExportStatus(null);
    
    try {
      console.log('🚀 Starting Word export with type:', type, 'department:', department, 'employee:', employee);
      console.log('📊 Available materials:', materials?.length || 0);
      console.log('📊 Available materialsDB:', materialsDB?.length || 0);
      console.log('🔧 Props check:', {
        materials: !!materials,
        materialsDB: !!materialsDB,
        getFilteredDataForExport: typeof getFilteredDataForExport,
        totalMaterials: totalMaterials,
        totalCategories: totalCategories,
        overallTotal: overallTotal
      });

      // Debug: Prikaži prve 3 materijala da vidimo strukturu
      if (materialsDB && materialsDB.length > 0) {
        console.log('🔍 Sample materialsDB data:', materialsDB.slice(0, 3).map(m => ({
          id: m?.id,
          name: m?.name,
          stockQuantity: m?.stockQuantity,
          hasStockQuantity: typeof m?.stockQuantity !== 'undefined',
          stockQuantityType: typeof m?.stockQuantity
        })));
      }

      // Provera da li su sve potrebne funkcije dostupne
      if (type === 'consumption' && (!getDatesForCurrentMonth || !getTotalForDate)) {
        throw new Error('Consumption export requires getDatesForCurrentMonth and getTotalForDate functions');
      }

      let title, content, fileName;
      let filteredMaterials = materialsDB || materials || []; // Koristimo materialsDB kao primarni izvor

      console.log('📋 Using materials for export:', filteredMaterials.length);

      // Aplikuj filtere ako su postavljeni
      if (department || employee) {
        console.log('🔍 Applying filters - department:', department, 'employee:', employee);
        filteredMaterials = getFilteredDataForExport ? getFilteredDataForExport(department, employee) : filteredMaterials;
        console.log('📋 Filtered materials count:', filteredMaterials.length);
      }

      // Dodatna provera da li su podaci validni
      if (!filteredMaterials || !Array.isArray(filteredMaterials)) {
        console.error('❌ Invalid filteredMaterials:', filteredMaterials);
        throw new Error('Invalid materials data for export');
      }

      // Provera da li svaki materijal ima potrebne svojstva
      const invalidMaterials = filteredMaterials.filter(m => !m || typeof m !== 'object');
      if (invalidMaterials.length > 0) {
        console.error('❌ Found invalid materials:', invalidMaterials);
        throw new Error(`Found ${invalidMaterials.length} invalid materials in data`);
      }
      
      // Generiši default ime fajla
      const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '_');
      
      switch(type) {
        case 'overview':
          title = "IZVEŠTAJ O STANJU POTROŠNOG MATERIJALA";
          content = generateOverviewContent(filteredMaterials);
          fileName = `Izdavanja_${timestamp}.docx`;
          break;
        case 'consumption':
          title = "IZVEŠTAJ O POTROŠNJI MATERIJALA";
          content = generateConsumptionContent(filteredMaterials);
          fileName = `Izdavanja_${timestamp}.docx`;
          break;
        case 'inventory':
          title = "IZVEŠTAJ O STANJU MAGACINA";
          content = generateInventoryContent(filteredMaterials);
          fileName = `Izdavanja_${timestamp}.docx`;
          break;
        default:
          title = "IZVEŠTAJ O STANJU POTROŠNOG MATERIJALA";
          content = generateOverviewContent(filteredMaterials);
          fileName = `Izdavanja_${timestamp}.docx`;
      }

      // Kreiranje Word dokumenta
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: [
            // Header sa logom i naslovom
            new Paragraph({
              children: [
                new TextRun({
                  text: "MR ENGINES",
                  size: 48,
                  font: "Arial",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 200,
              },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 32,
                  font: "Arial",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 400,
              },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: `IZVEŠTAJ ZA ${getMonthName(selectedMonth).toUpperCase()} ${selectedYear}`,
                  size: 24,
                  font: "Arial",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 600,
              },
            }),

            ...content,

            // Footer
            new Paragraph({
              children: [
                            new TextRun({
              text: `Izveštaj generisan: ${new Date().toLocaleDateString('sr-RS')}`,
              size: 16,
              font: "Arial",
              color: "666666",
            }),
              ],
              alignment: AlignmentType.RIGHT,
              spacing: {
                before: 600,
              },
            }),
          ],
        }],
      });

      // Generisanje blob-a
      const blob = await Packer.toBlob(doc);
      
      // Koristi Save As dialog
      const result = await saveAsWorkflow(
        blob, 
        currentPeriod, 
        'docx',
        [
          {
            name: 'Word Documents',
            extensions: ['docx', 'doc']
          }
        ]
      );
      
      if (result.success) {
        showToast(result.message, 'success');
        console.log('✅ Word export completed successfully:', result.filePath);
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('❌ Greška pri izvozu Word dokumenta:', error);
      console.error('Detalji greške:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Prikaži grešku korisniku
      showToast(`Greška pri izvozu: ${error.message}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Funkcija za generisanje preglednog sadržaja
  const generateOverviewContent = (filteredMaterials) => {
    console.log('📄 Generating overview content with', filteredMaterials.length, 'materials');

    // Provera da li su podaci validni
    if (!filteredMaterials || filteredMaterials.length === 0) {
      console.warn('⚠️ No materials data available for overview content');
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: "Nema dostupnih podataka za izveštaj",
              size: 24,
              font: "Arial"
            })
          ]
        })
      ];
    }

    // Dodatna provera strukture podataka
    console.log('🔍 Checking materials structure...');
    filteredMaterials.forEach((material, index) => {
      if (!material || typeof material !== 'object') {
        console.error(`❌ Invalid material at index ${index}:`, material);
      } else {
        console.log(`✅ Material ${index}:`, {
          id: material?.id,
          name: material?.name,
          category: material?.category,
          stockQuantity: material?.stockQuantity,
          minStock: material?.minStock,
          unit: material?.unit
        });
      }
    });

    return [
      // Statistike
      new Paragraph({
        children: [
                  new TextRun({
          text: "PREGLED STATISTIKA",
          bold: true,
          size: 28,
          font: "Arial",
        }),
        ],
        spacing: {
          before: 400,
          after: 200,
        },
      }),

      new Paragraph({
        children: [
                  new TextRun({
          text: `Ukupno materijala: ${totalMaterials}`,
          size: 20,
          font: "Arial",
        }),
        ],
        spacing: {
          after: 100,
        },
      }),

      new Paragraph({
        children: [
                  new TextRun({
          text: `Broj kategorija: ${totalCategories}`,
          size: 20,
          font: "Arial",
        }),
        ],
        spacing: {
          after: 100,
        },
      }),

      new Paragraph({
        children: [
                  new TextRun({
          text: `Ukupna količina: ${overallTotal}`,
          size: 20,
          font: "Arial",
        }),
        ],
        spacing: {
          after: 400,
        },
      }),

      // Tabela materijala
      new Paragraph({
        children: [
                  new TextRun({
          text: "DETALJAN PREGLED MATERIJALA",
          bold: true,
          size: 28,
          font: "Arial",
        }),
        ],
        spacing: {
          before: 400,
          after: 200,
        },
      }),

      // Kreiranje tabele
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          // Header red
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: "Kategorija", alignment: AlignmentType.CENTER })],
                width: { size: 25, type: WidthType.PERCENTAGE },
                shading: { fill: "CCCCCC" },
              }),
              new TableCell({
                children: [new Paragraph({ text: "Naziv", alignment: AlignmentType.CENTER })],
                width: { size: 35, type: WidthType.PERCENTAGE },
                shading: { fill: "CCCCCC" },
              }),
              new TableCell({
                children: [new Paragraph({ text: "Stanje", alignment: AlignmentType.CENTER })],
                width: { size: 15, type: WidthType.PERCENTAGE },
                shading: { fill: "CCCCCC" },
              }),
              new TableCell({
                children: [new Paragraph({ text: "Jedinica", alignment: AlignmentType.CENTER })],
                width: { size: 15, type: WidthType.PERCENTAGE },
                shading: { fill: "CCCCCC" },
              }),
              new TableCell({
                children: [new Paragraph({ text: "Min. stanje", alignment: AlignmentType.CENTER })],
                width: { size: 10, type: WidthType.PERCENTAGE },
                shading: { fill: "CCCCCC" },
              }),
            ],
          }),
          // Redovi sa podacima
          ...filteredMaterials.map((material, index) => {
            console.log('📝 Processing material', index + 1, ':', material?.name || 'undefined');

            // Provera da li je material objekat
            if (!material || typeof material !== 'object') {
              console.warn('⚠️ Invalid material at index', index, ':', material);
              return new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Greška u podacima' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'N/A' })] }),
                  new TableCell({ children: [new Paragraph({ text: '0', alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: 'N/A', alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: '0', alignment: AlignmentType.CENTER })] }),
                ]
              });
            }

            return new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: material.category || 'N/A' })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: material.name || 'N/A' })],
                }),
                new TableCell({
                  children: [new Paragraph({
                    text: (material && typeof material.stockQuantity === 'number' ? material.stockQuantity : 0).toString(),
                    alignment: AlignmentType.CENTER
                  })],
                }),
                new TableCell({
                  children: [new Paragraph({
                    text: (material && material.unit) || 'N/A',
                    alignment: AlignmentType.CENTER
                  })],
                }),
                new TableCell({
                  children: [new Paragraph({
                    text: (material && typeof material.minStock === 'number' ? material.minStock : 0).toString(),
                    alignment: AlignmentType.CENTER
                  })],
                }),
              ],
            });
          }),
        ],
      }),
    ];
  };

  // Funkcija za generisanje sadržaja o potrošnji
  const generateConsumptionContent = (filteredMaterials) => {
    const dates = getDatesForCurrentMonth();
    
    return [
      new Paragraph({
        children: [
                  new TextRun({
          text: "PREGLED POTROŠNJE PO DATUMIMA",
          bold: true,
          size: 28,
          font: "Arial",
        }),
        ],
        spacing: {
          before: 400,
          after: 200,
        },
      }),

      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          // Header red
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: "Kategorija", alignment: AlignmentType.CENTER })],
                width: { size: 30, type: WidthType.PERCENTAGE },
                shading: { fill: "CCCCCC" },
              }),
              ...dates.map(date => 
                new TableCell({
                  children: [new Paragraph({ text: date, alignment: AlignmentType.CENTER })],
                  width: { size: 70 / dates.length, type: WidthType.PERCENTAGE },
                  shading: { fill: "CCCCCC" },
                })
              ),
            ],
          }),
          // Redovi sa podacima
          ...(materials || []).map(material => 
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: (material?.category || 'N/A') + ' - ' + (material?.name || 'N/A') })],
                }),
                ...dates.map(date => 
                  new TableCell({
                    children: [new Paragraph({ 
                      text: getTotalForDate(material?.id, date)?.toString() || '0', 
                      alignment: AlignmentType.CENTER 
                    })],
                  })
                ),
              ],
            })
          ),
        ],
      }),
    ];
  };

  // Funkcija za generisanje sadržaja o stanju magacina
  const generateInventoryContent = (filteredMaterials) => {
    return [
      new Paragraph({
        children: [
                  new TextRun({
          text: "STANJE ZALIHA U MAGACINU",
          bold: true,
          size: 28,
          font: "Arial",
        }),
        ],
        spacing: {
          before: 400,
          after: 200,
        },
      }),

      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          // Header red
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: "Kategorija", alignment: AlignmentType.CENTER })],
                width: { size: 25, type: WidthType.PERCENTAGE },
                shading: { fill: "CCCCCC" },
              }),
              new TableCell({
                children: [new Paragraph({ text: "Naziv", alignment: AlignmentType.CENTER })],
                width: { size: 35, type: WidthType.PERCENTAGE },
                shading: { fill: "CCCCCC" },
              }),
              new TableCell({
                children: [new Paragraph({ text: "Stanje", alignment: AlignmentType.CENTER })],
                width: { size: 15, type: WidthType.PERCENTAGE },
                shading: { fill: "CCCCCC" },
              }),
              new TableCell({
                children: [new Paragraph({ text: "Jedinica", alignment: AlignmentType.CENTER })],
                width: { size: 15, type: WidthType.PERCENTAGE },
                shading: { fill: "CCCCCC" },
              }),
              new TableCell({
                children: [new Paragraph({ text: "Min. stanje", alignment: AlignmentType.CENTER })],
                width: { size: 10, type: WidthType.PERCENTAGE },
                shading: { fill: "CCCCCC" },
              }),
            ],
          }),
          // Redovi sa podacima
          ...(materialsDB || []).map(material =>
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: material?.category || 'N/A' })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: material?.name || 'N/A' })],
                }),
                new TableCell({
                  children: [new Paragraph({
                    text: (material && typeof material.stockQuantity === 'number' ? material.stockQuantity : 0).toString(),
                    alignment: AlignmentType.CENTER
                  })],
                }),
                new TableCell({
                  children: [new Paragraph({
                    text: material?.unit || 'N/A',
                    alignment: AlignmentType.CENTER
                  })],
                }),
                new TableCell({
                  children: [new Paragraph({
                    text: (material && typeof material.minStock === 'number' ? material.minStock : 0).toString(),
                    alignment: AlignmentType.CENTER
                  })],
                }),
              ],
            })
          ),
        ],
      }),
    ];
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem'
    }}>
        <button
          className="btn"
          onClick={() => exportToWord('overview')}
          disabled={isExporting}
          style={{
            background: isExporting ? '#6b7280' : '#059669',
            border: `2px solid ${isExporting ? '#4b5563' : '#047857'}`,
            color: '#ffffff',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            opacity: isExporting ? 0.7 : 1
          }}
        >
          {isExporting ? <Loader2 size={24} className="animate-spin" /> : <FileText size={24} />}
          <div style={{ marginTop: '0.5rem' }}>
            {isExporting ? 'Generiše se...' : 'Export Svi Podaci'}
          </div>
          <small style={{ fontWeight: '400', opacity: '0.9' }}>
            {isExporting ? 'Molimo sačekajte...' : 'Kompletan izveštaj'}
          </small>
        </button>

        <button
          className="btn"
          onClick={() => exportToWord('consumption')}
          disabled={isExporting}
          style={{
            background: isExporting ? '#6b7280' : '#7c3aed',
            border: `2px solid ${isExporting ? '#4b5563' : '#6d28d9'}`,
            color: '#ffffff',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            opacity: isExporting ? 0.7 : 1
          }}
        >
          {isExporting ? <Loader2 size={24} className="animate-spin" /> : <FileText size={24} />}
          <div style={{ marginTop: '0.5rem' }}>
            {isExporting ? 'Generiše se...' : 'Export Potrošnja'}
          </div>
          <small style={{ fontWeight: '400', opacity: '0.9' }}>
            {isExporting ? 'Molimo sačekajte...' : 'Po datumima'}
          </small>
        </button>

        <button
          className="btn"
          onClick={() => exportToWord('inventory')}
          disabled={isExporting}
          style={{
            background: isExporting ? '#6b7280' : '#dc2626',
            border: `2px solid ${isExporting ? '#4b5563' : '#b91c1c'}`,
            color: '#ffffff',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            opacity: isExporting ? 0.7 : 1
          }}
        >
          {isExporting ? <Loader2 size={24} className="animate-spin" /> : <FileText size={24} />}
          <div style={{ marginTop: '0.5rem' }}>
            {isExporting ? 'Generiše se...' : 'Export Magacin'}
          </div>
          <small style={{ fontWeight: '400', opacity: '0.9' }}>
            {isExporting ? 'Molimo sačekajte...' : 'Stanje zaliha'}
          </small>
        </button>

        {/* Toast poruke */}
        {exportStatus && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: exportStatus.type === 'success' ? '#059669' : '#dc2626',
            color: '#ffffff',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
            maxWidth: '400px',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            {exportStatus.message}
          </div>
        )}
    </div>
  );
};

export default WordExporter;
