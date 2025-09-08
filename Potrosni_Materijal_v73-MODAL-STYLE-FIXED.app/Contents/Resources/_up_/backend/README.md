# Backend API - Aplikacija za Praćenje Potrošnog Materijala

Backend server sa SQLite bazom podataka i REST API endpoints za aplikaciju praćenja potrošnog materijala.

## 🚀 Pokretanje

### 1. Instalacija zavisnosti
```bash
npm install
```

### 2. Pokretanje u development modu
```bash
npm run dev
```

### 3. Pokretanje u production modu
```bash
npm start
```

## 📊 API Endpoints

### Materijali
- `GET /api/materials` - Učitaj sve materijale
- `GET /api/materials?category=POTROSNI_MATERIJAL` - Filtriraj po kategoriji
- `GET /api/materials?search=nitro` - Pretraži po nazivu
- `POST /api/materials` - Dodaj novi materijal
- `PUT /api/materials/:id` - Ažuriraj materijal
- `DELETE /api/materials/:id` - Obriši materijal

### Zaposleni
- `GET /api/employees` - Učitaj sve zaposlene
- `GET /api/employees?department=Proizvodnja` - Filtriraj po odeljenju
- `POST /api/employees` - Dodaj novog zaposlenog

### Zaduženja
- `GET /api/assignments` - Učitaj sva zaduženja
- `GET /api/assignments?date=01.08.` - Filtriraj po datumu
- `POST /api/assignments` - Dodaj novo zaduženje

### Statistike
- `GET /api/stats/overview` - Pregled statistika
- `GET /api/health` - Health check

## 🗄️ Baza Podataka

### Tabele
- **materials** - Materijali sa kategorijama i stanjem
- **employees** - Zaposleni sa odeljenjima
- **assignments** - Zaduženja materijala zaposlenima

### Indeksi
- `idx_materials_category` - Brže pretrage po kategoriji
- `idx_assignments_date` - Brže pretrage po datumu
- `idx_employees_department` - Brže pretrage po odeljenju

## 🔧 Konfiguracija

### Port
Server se pokreće na portu 5000 (može se promeniti preko `PORT` environment varijable)

### CORS
Omogućen je pristup sa frontend-a (localhost:3000)

### Security
- Helmet.js za security headers
- Morgan za logging
- SQL injection zaštita kroz parametrizovane upite

## 📝 Primer Korišćenja

### Dodavanje materijala
```bash
curl -X POST http://localhost:5000/api/materials \
  -H "Content-Type: application/json" \
  -d '{
    "category": "POTROSNI MATERIJAL",
    "name": "Novi materijal",
    "stockQuantity": 100,
    "unit": "kom",
    "minStock": 10
  }'
```

### Učitavanje materijala
```bash
curl http://localhost:5000/api/materials?category=POTROSNI_MATERIJAL
```

## 🚨 Troubleshooting

### Port već zauzet
```bash
# Proverite koji proces koristi port 5000
lsof -i :5000

# Zaustavite proces ili promenite port
PORT=5001 npm run dev
```

### Baza podataka nije kreirana
```bash
# Proverite da li postoji database.sqlite fajl
ls -la database.sqlite

# Ako ne postoji, restartujte server
npm run dev
```

## 🔄 Integracija sa Frontend-om

Backend je konfigurisan da radi sa React frontend-om na portu 3000. CORS je omogućen za cross-origin requests.

## 📊 Performanse

- SQLite sa indeksima za brže pretrage
- Parametrizovani upiti za SQL injection zaštitu
- Optimizovani JOIN upiti za zaduženja
- Connection pooling za bolje performanse
