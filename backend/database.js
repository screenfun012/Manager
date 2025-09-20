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

// Funkcija za inicijalizaciju prazne baze (bez sample podataka)
const initializeEmptyDatabase = () => {
  console.log('🗄️ Inicijalizujem praznu SQLite bazu...');
  
  // Provera da li baza postoji i da li je prazna
  db.get('SELECT COUNT(*) as count FROM materials', (err, row) => {
    if (err) {
      console.error('Greška pri proveri materijala:', err);
      return;
    }

    if (row.count === 0) {
      console.log('✨ Baza je prazna - spremna za korišćenje');
      console.log('📝 Korisnik može da doda materijale i zaposlene preko aplikacije');
    } else {
      console.log(`ℹ️ Baza već sadrži ${row.count} materijala`);
    }
  });
};

module.exports = { db, initDatabase, initializeEmptyDatabase };
