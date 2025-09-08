const { db, initDatabase } = require('./database');

// Podaci iz trenutne aplikacije (kopirani iz App.js)
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

const employeesDatabase = [
  { id: 1, name: 'Marko Petrović', department: 'Proizvodnja', position: 'Proizvodni radnik', phone: '061-123-456' },
  { id: 2, name: 'Ana Jovanović', department: 'Održavanje', position: 'Tehničar', phone: '061-234-567' },
  { id: 3, name: 'Petar Nikolić', department: 'Kontrola kvaliteta', position: 'Kontrolor', phone: '061-345-678' },
  { id: 4, name: 'Marija Đorđević', department: 'Logistika', position: 'Logističar', phone: '061-456-789' },
  { id: 5, name: 'Stefan Stojanović', department: 'Administracija', position: 'Administrativni radnik', phone: '061-567-890' },
  { id: 6, name: 'Jelena Marković', department: 'IT Odeljenje', position: 'IT Administrator', phone: '061-678-901' }
];

// Funkcija za migraciju materijala
const migrateMaterials = () => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Migriram materijale...');
    
    const stmt = db.prepare('INSERT INTO materials (category, name, stockQuantity, unit, minStock) VALUES (?, ?, ?, ?, ?)');
    
    let completed = 0;
    const total = materialsDatabase.length;
    
    materialsDatabase.forEach(material => {
      stmt.run(material.category, material.name, material.stockQuantity, material.unit, material.minStock, (err) => {
        if (err) {
          console.error(`❌ Greška pri migraciji materijala ${material.name}:`, err);
        } else {
          completed++;
          console.log(`✅ Migriran materijal: ${material.name}`);
        }
        
        if (completed === total) {
          stmt.finalize();
          console.log(`✅ Migracija materijala završena: ${completed}/${total}`);
          resolve();
        }
      });
    });
  });
};

// Funkcija za migraciju zaposlenih
const migrateEmployees = () => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Migriram zaposlene...');
    
    const stmt = db.prepare('INSERT INTO employees (name, department, position, phone) VALUES (?, ?, ?, ?)');
    
    let completed = 0;
    const total = employeesDatabase.length;
    
    employeesDatabase.forEach(employee => {
      stmt.run(employee.name, employee.department, employee.position, employee.phone, (err) => {
        if (err) {
          console.error(`❌ Greška pri migraciji zaposlenog ${employee.name}:`, err);
        } else {
          completed++;
          console.log(`✅ Migriran zaposleni: ${employee.name}`);
        }
        
        if (completed === total) {
          stmt.finalize();
          console.log(`✅ Migracija zaposlenih završena: ${completed}/${total}`);
          resolve();
        }
      });
    });
  });
};

// Glavna funkcija za migraciju
const runMigration = async () => {
  try {
    console.log('🚀 Počinjem migraciju podataka...');
    
    // Inicijalizuj bazu
    initDatabase();
    
    // Sačekaj da se baza inicijalizuje
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Proveri da li već postoje podaci
    db.get('SELECT COUNT(*) as count FROM materials', async (err, row) => {
      if (err) {
        console.error('❌ Greška pri proveri baze:', err);
        return;
      }
      
      if (row.count === 0) {
        console.log('📥 Baza je prazna, počinjem migraciju...');
        
        // Pokreni migracije
        await migrateMaterials();
        await migrateEmployees();
        
        console.log('🎉 Migracija uspešno završena!');
        console.log(`📊 Materijali: ${materialsDatabase.length}`);
        console.log(`👥 Zaposleni: ${employeesDatabase.length}`);
        
        // Zatvori bazu
        db.close();
      } else {
        console.log('ℹ️ Baza već sadrži podatke, preskačem migraciju');
        db.close();
      }
    });
    
  } catch (error) {
    console.error('❌ Greška pri migraciji:', error);
    db.close();
  }
};

// Pokreni migraciju ako se fajl direktno izvršava
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
