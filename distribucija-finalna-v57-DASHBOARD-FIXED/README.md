# Aplikacija za Praćenje Potrošnog Materijala

Moderno web rešenje za upravljanje i praćenje potrošnog materijala, inspirisano Excel template-om "AVGUST RAZDUZENJE_novi template.xlsx".

## 🚀 Funkcionalnosti

- **Pregled Materijala**: Organizovano po kategorijama (POTROSNI MATERIJAL, ZASTITNA OPREMA, MESINGANE CETKE, HIGIJENA, AMBALAZA, ALAT)
- **Dnevno Praćenje**: Unos količina za svaki radni dan u mesecu
- **Excel Import/Export**: Učitavanje postojećih Excel fajlova i izvoz podataka
- **Dodavanje Novih Materijala**: Jednostavno dodavanje novih stavki u sistem
- **Automatski Kalkulacije**: Sumiranje po kategorijama i datumu
- **Responsive Design**: Moderna i intuitivna korisnička interfejs
- **SQL Baza Podataka**: Brza i efikasna SQLite baza sa REST API

## 🛠️ Tehnologije

- **Frontend**: React 18
- **Backend**: Node.js + Express
- **Baza Podataka**: SQLite sa indeksima
- **Styling**: CSS3 sa modernim dizajnom
- **Excel Processing**: SheetJS (xlsx)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Instalacija

### 1. Frontend (React)
```bash
# Klonirajte repozitorijum
git clone <repository-url>
cd potrosni-materijal-app

# Instalirajte zavisnosti
npm install

# Pokrenite frontend
npm start
```

### 2. Backend (Node.js + SQLite)
```bash
# Idite u backend folder
cd backend

# Instalirajte zavisnosti
npm install

# Pokrenite backend server
npm run dev

# Opciono: Pokrenite migraciju podataka
npm run migrate
```

## 🌐 Pokretanje Aplikacije

### Frontend
- **URL**: `http://localhost:3000`
- **Port**: 3000
- **Status**: React aplikacija

### Backend API
- **URL**: `http://localhost:5001/api`
- **Port**: 5001
- **Status**: Express server sa SQLite bazom

## 📊 Kako Koristiti

### 1. Pregled Materijala
- Aplikacija prikazuje sve materijale organizovane po kategorijama
- Svaki materijal ima kolone za svaki radni dan u mesecu
- Automatski se računaju ukupne količine po kategorijama

### 2. Unos Količina
- Kliknite na bilo koju ćeliju u tabeli za unos količine
- Unesite broj i pritisnite Enter ili kliknite na Save ikonu
- Količine se automatski sumiraju u UKUPNO kolonu

### 3. Dodavanje Novog Materijala
- Kliknite na "Dodaj Materijal" dugme
- Popunite formu sa kategorijom i nazivom
- Novi materijal se automatski dodaje u odgovarajuću kategoriju

### 4. Učitavanje Excel Fajla
- Prevucite Excel fajl u upload zonu ili kliknite za odabir
- Podržani formati: .xlsx, .xls
- Fajl se automatski obrađuje i podaci se učitavaju

### 5. Izvoz Podataka
- Kliknite na "Izvezi Excel" za preuzimanje trenutnih podataka
- Podaci se izvode u Excel format sa istom strukturom

## 🗄️ Struktura Podataka

### SQLite Baza
Aplikacija koristi SQLite bazu sa sledećim tabelama:

```sql
-- Tabela materijala
CREATE TABLE materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  stockQuantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'kom',
  minStock INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela zaposlenih
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela zaduženja
CREATE TABLE assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material_id INTEGER,
  employee_id INTEGER,
  quantity INTEGER NOT NULL,
  date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (material_id) REFERENCES materials (id),
  FOREIGN KEY (employee_id) REFERENCES employees (id)
);
```

### Indeksi za Performanse
- `idx_materials_category` - Brže pretrage po kategoriji
- `idx_assignments_date` - Brže pretrage po datumu
- `idx_employees_department` - Brže pretrage po odeljenju

## 📅 Datumi

- Aplikacija automatski generiše radne dane za izabrani mesec
- Vikendi se automatski preskaču
- Datumi se formatiraju kao "DD.MM." (npr. "01.08.")

## 🎨 Dizajn

- **Moderna UI/UX**: Gradient pozadine, senke, hover efekti
- **Responsive**: Prilagođava se različitim veličinama ekrana
- **Intuitivna navigacija**: Jasno označene akcije i dugmad
- **Konsistentan stil**: Jedinstveni dizajn kroz celu aplikaciju

## 🔧 Konfiguracija

### Promena Meseca/Godine
U `App.js` fajlu možete promeniti:
```javascript
const [selectedMonth, setSelectedMonth] = useState('08'); // 08 = Avgust
const [selectedYear, setSelectedYear] = useState('2024');
```

### Dodavanje Novih Kategorija
U `sampleCategories` nizu dodajte nove kategorije:
```javascript
const sampleCategories = [
  'POTROSNI MATERIJAL',
  'ZASTITNA OPREMA',
  'NOVA_KATEGORIJA', // Dodajte ovde
  // ...
];
```

### Backend Konfiguracija
U `backend/server.js` možete promeniti port:
```javascript
const PORT = process.env.PORT || 5001;
```

## 📱 Responsive Design

Aplikacija je optimizovana za:
- **Desktop**: Puna funkcionalnost sa svim kolonama
- **Tablet**: Prilagođena tabela sa horizontalnim scroll-om
- **Mobile**: Vertikalni prikaz sa optimizovanim dugmadima

## 🚀 Deployment

### Frontend
```bash
npm run build
```
Build folder možete deployovati na bilo koji statički hosting servis.

### Backend
```bash
# Production
npm start

# Ili sa PM2
pm2 start server.js --name "potrosni-materijal-api"
```

## 🔄 API Endpoints

### Materijali
- `GET /api/materials` - Učitaj sve materijale
- `POST /api/materials` - Dodaj novi materijal
- `PUT /api/materials/:id` - Ažuriraj materijal
- `DELETE /api/materials/:id` - Obriši materijal

### Zaposleni
- `GET /api/employees` - Učitaj sve zaposlene
- `POST /api/employees` - Dodaj novog zaposlenog

### Statistike
- `GET /api/stats/overview` - Pregled statistika
- `GET /api/health` - Health check

## 🤝 Doprinosi

1. Fork repozitorijuma
2. Kreirajte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit promene (`git commit -m 'Add some AmazingFeature'`)
4. Push na branch (`git push origin feature/AmazingFeature`)
5. Otvorite Pull Request

## 📄 Licenca

Ovaj projekat je otvorenog koda i dostupan pod MIT licencom.

## 📞 Podrška

Za pitanja ili probleme, otvorite issue na GitHub-u ili kontaktirajte development tim.

---

**Napomena**: Ova aplikacija je demo verzija namenjena testiranju i implementaciji novih funkcionalnosti. Sada koristi SQLite bazu podataka za bolje performanse i skalabilnost.
