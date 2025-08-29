import React from 'react';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { FileText } from 'lucide-react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const WordExporter = ({ 
  materials, 
  materialsDB, 
  selectedMonth, 
  selectedYear, 
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
    try {
      let title, content, fileName;
      let filteredMaterials = materials;
      
      // Aplikuj filtere ako su postavljeni
      if (department || employee) {
        filteredMaterials = getFilteredDataForExport(department, employee);
      }
      
      switch(type) {
        case 'overview':
          title = "IZVEŠTAJ O STANJU POTROŠNOG MATERIJALA";
          content = generateOverviewContent(filteredMaterials);
          fileName = `Izvestaj_Potrosni_Materijal_${department || 'Sva'}_${employee || 'Svi'}_${selectedMonth}_${selectedYear}.docx`;
          break;
        case 'consumption':
          title = "IZVEŠTAJ O POTROŠNJI MATERIJALA";
          content = generateConsumptionContent(filteredMaterials);
          fileName = `Potrosnja_Materijala_${department || 'Sva'}_${employee || 'Svi'}_${selectedMonth}_${selectedYear}.docx`;
          break;
        case 'inventory':
          title = "IZVEŠTAJ O STANJU MAGACINA";
          content = generateInventoryContent(filteredMaterials);
          fileName = `Stanje_Magacina_${department || 'Sva'}_${employee || 'Svi'}_${selectedMonth}_${selectedYear}.docx`;
          break;
        default:
          title = "IZVEŠTAJ O STANJU POTROŠNOG MATERIJALA";
          content = generateOverviewContent(filteredMaterials);
          fileName = `Izvestaj_Potrosni_Materijal_${department || 'Sva'}_${employee || 'Svi'}_${selectedMonth}_${selectedYear}.docx`;
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
                  text: "COMPANY LOGO",
                  size: 48,
                  font: "Oswald",
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
                  font: "Oswald",
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
                  font: "Oswald",
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
              font: "Oswald",
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

      // Generisanje i preuzimanje dokumenta
      const blob = await Packer.toBlob(doc);
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Greška pri izvozu Word dokumenta:', error);
      alert('Došlo je do greške pri izvozu Word dokumenta.');
    }
  };

  // Funkcija za generisanje preglednog sadržaja
  const generateOverviewContent = (filteredMaterials) => {
    return [
      // Statistike
      new Paragraph({
        children: [
                  new TextRun({
          text: "PREGLED STATISTIKA",
          bold: true,
          size: 28,
          font: "Oswald",
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
          font: "Oswald",
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
          font: "Oswald",
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
          font: "Oswald",
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
          font: "Oswald",
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
          ...materials.map(material => 
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: material.category })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: material.name })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: material.stockQuantity.toString(), alignment: AlignmentType.CENTER })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: material.unit, alignment: AlignmentType.CENTER })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: material.minStock.toString(), alignment: AlignmentType.CENTER })],
                }),
              ],
            })
          ),
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
          font: "Oswald",
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
          ...materials.map(material => 
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: material.category + ' - ' + material.name })],
                }),
                ...dates.map(date => 
                  new TableCell({
                    children: [new Paragraph({ 
                      text: getTotalForDate(material.id, date)?.toString() || '0', 
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
          font: "Oswald",
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
          ...materialsDB.map(material => 
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: material.category })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: material.name })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: material.stockQuantity.toString(), alignment: AlignmentType.CENTER })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: material.unit, alignment: AlignmentType.CENTER })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: material.minStock.toString(), alignment: AlignmentType.CENTER })],
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
          style={{
            background: '#059669',
            border: '2px solid #047857',
            color: '#ffffff',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          <FileText size={24} />
          <div style={{ marginTop: '0.5rem' }}>Export Pregled</div>
          <small style={{ fontWeight: '400', opacity: '0.9' }}>
            Kompletan izveštaj
          </small>
        </button>

        <button
          className="btn"
          onClick={() => exportToWord('consumption')}
          style={{
            background: '#7c3aed',
            border: '2px solid #6d28d9',
            color: '#ffffff',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          <FileText size={24} />
          <div style={{ marginTop: '0.5rem' }}>Export Potrošnja</div>
          <small style={{ fontWeight: '400', opacity: '0.9' }}>
            Po datumima
          </small>
        </button>

        <button
          className="btn"
          onClick={() => exportToWord('inventory')}
          style={{
            background: '#dc2626',
            border: '2px solid #b91c1c',
            color: '#ffffff',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          <FileText size={24} />
          <div style={{ marginTop: '0.5rem' }}>Export Magacin</div>
          <small style={{ fontWeight: '400', opacity: '0.9' }}>
            Stanje zaliha
          </small>
        </button>
    </div>
  );
};

export default WordExporter;
