const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Kreiranje SQLite baze
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Kreiranje tabela
const initDatabase = () => {
  db.serialize(() => {
    // Tabela materijala
    db.run(`CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      stockQuantity INTEGER DEFAULT 0,
      unit TEXT DEFAULT 'kom',
      minStock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela zaposlenih
    db.run(`CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      position TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela zaduženja
    db.run(`CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER,
      employee_id INTEGER,
      quantity INTEGER NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (material_id) REFERENCES materials (id),
      FOREIGN KEY (employee_id) REFERENCES employees (id)
    )`);

    // Indeksi za brže pretrage
    db.run('CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category)');
    db.run('CREATE INDEX IF NOT EXISTS idx_assignments_date ON assignments(date)');
    db.run('CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department)');

    console.log('🗄️ SQLite baza podataka inicijalizovana');
  });
};

// Funkcija za učitavanje postojećih podataka
const loadSampleData = () => {
  // Učitavanje materijala
  const materials = [
    { category: 'POTROSNI MATERIJAL', name: 'nitro razredjivac pentico', stockQuantity: 50, unit: 'kom', minStock: 10 },
    { category: 'POTROSNI MATERIJAL', name: 'odmascivac forch eco 500ml', stockQuantity: 100, unit: 'kom', minStock: 20 },
    { category: 'POTROSNI MATERIJAL', name: 'crni silikon DIHT MASA CRNA DIRKO 320C', stockQuantity: 25, unit: 'kom', minStock: 5 },
    { category: 'ZASTITNA OPREMA', name: 'rukavice radne', stockQuantity: 200, unit: 'par', minStock: 50 },
    { category: 'ZASTITNA OPREMA', name: 'naočare zaštitne', stockQuantity: 30, unit: 'kom', minStock: 10 },
    { category: 'MESINGANE CETKE', name: 'cetka mesingana 2"', stockQuantity: 15, unit: 'kom', minStock: 3 },
    { category: 'HIGIJENA', name: 'sapun za ruke', stockQuantity: 50, unit: 'kom', minStock: 10 },
    { category: 'AMBALAZA', name: 'kartonske kutije', stockQuantity: 200, unit: 'kom', minStock: 50 },
    { category: 'ALAT', name: 'ključ 17', stockQuantity: 8, unit: 'kom', minStock: 2 }
  ];

  // Učitavanje zaposlenih
  const employees = [
    { name: 'Marko Petrović', department: 'Proizvodnja', position: 'Proizvodni radnik', phone: '061-123-456' },
    { name: 'Ana Jovanović', department: 'Održavanje', position: 'Tehničar', phone: '061-234-567' },
    { name: 'Petar Nikolić', department: 'Kontrola kvaliteta', position: 'Kontrolor', phone: '061-345-678' }
  ];

  // Provera da li već postoje podaci
  db.get('SELECT COUNT(*) as count FROM materials', (err, row) => {
    if (err) {
      console.error('Greška pri proveri materijala:', err);
      return;
    }

    if (row.count === 0) {
      console.log('📥 Učitavam sample podatke...');
      
      // Učitavanje materijala
      const materialStmt = db.prepare('INSERT INTO materials (category, name, stockQuantity, unit, minStock) VALUES (?, ?, ?, ?, ?)');
      materials.forEach(material => {
        materialStmt.run(material.category, material.name, material.stockQuantity, material.unit, material.minStock);
      });
      materialStmt.finalize();

      // Učitavanje zaposlenih
      const employeeStmt = db.prepare('INSERT INTO employees (name, department, position, phone) VALUES (?, ?, ?, ?)');
      employees.forEach(employee => {
        employeeStmt.run(employee.name, employee.department, employee.position, employee.phone);
      });
      employeeStmt.finalize();

      console.log('✅ Sample podaci učitani');
    } else {
      console.log('ℹ️ Baza već sadrži podatke');
    }
  });
};

module.exports = { db, initDatabase, loadSampleData };
