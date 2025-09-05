# 🚀 Setup Instrukcije - Backend i SQL Baza

## 📋 Preduvjeti

- **Node.js** (verzija 16 ili novija)
- **npm** (verzija 8 ili novija)
- **Git** (za kloniranje repozitorijuma)

## 🔧 Korak 1: Instalacija Backend-a

### 1.1 Idite u backend folder
```bash
cd backend
```

### 1.2 Instalirajte zavisnosti
```bash
npm install
```

### 1.3 Proverite da li su sve zavisnosti instalirane
```bash
npm list --depth=0
```

## 🗄️ Korak 2: Pokretanje SQL Baze

### 2.1 Pokrenite backend server
```bash
npm run dev
```

**Očekivani output:**
```
🚀 Backend server pokrenut na portu 5001
📊 API dostupan na: http://localhost:5001/api
🔍 Health check: http://localhost:5001/api/health
🗄️ Baza podataka: SQLite
🗄️ SQLite baza podataka inicijalizovana
📥 Učitavam sample podatke...
✅ Sample podaci učitani
```

### 2.2 Proverite da li server radi
Otvorite browser i idite na: `http://localhost:5001/api/health`

**Očekivani response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-XX...",
  "database": "SQLite",
  "version": "1.0.0"
}
```

## 📊 Korak 3: Migracija Podataka

### 3.1 Pokrenite migraciju (opciono)
```bash
npm run migrate
```

**Očekivani output:**
```
🚀 Počinjem migraciju podataka...
🗄️ SQLite baza podataka inicijalizovana
📥 Učitavam sample podatke...
🔄 Migriram materijale...
✅ Migriran materijal: nitro razredjivac pentico
✅ Migriran materijal: odmascivac forch eco 500ml
...
🔄 Migriram zaposlene...
✅ Migriran zaposleni: Marko Petrović
✅ Migriran zaposleni: Ana Jovanović
...
🎉 Migracija uspešno završena!
📊 Materijali: 39
👥 Zaposleni: 6
```

## 🌐 Korak 4: Testiranje API Endpoints

### 4.1 Testirajte materijale
```bash
# Učitaj sve materijale
curl http://localhost:5001/api/materials

# Filtriraj po kategoriji
curl "http://localhost:5001/api/materials?category=POTROSNI_MATERIJAL"

# Pretraži po nazivu
curl "http://localhost:5001/api/materials?search=nitro"
```

### 4.2 Testirajte zaposlene
```bash
# Učitaj sve zaposlene
curl http://localhost:5001/api/employees

# Filtriraj po odeljenju
curl "http://localhost:5001/api/employees?department=Proizvodnja"
```

### 4.3 Testirajte statistike
```bash
# Pregled statistika
curl http://localhost:5001/api/stats/overview
```

## 🔍 Korak 5: Provera Baze Podataka

### 5.1 SQLite baza se automatski kreira
- **Lokacija**: `backend/database.sqlite`
- **Veličina**: ~100KB (sa sample podacima)
- **Format**: SQLite 3

### 5.2 Možete koristiti SQLite CLI za proveru
```bash
# Instalirajte SQLite CLI (opciono)
brew install sqlite3  # macOS
sudo apt-get install sqlite3  # Ubuntu

# Povežite se sa bazom
sqlite3 backend/database.sqlite

# Pregledajte tabele
.tables

# Pregledajte materijale
SELECT * FROM materials LIMIT 5;

# Pregledajte zaposlene
SELECT * FROM employees LIMIT 5;

# Izlaz
.quit
```

## 🚨 Troubleshooting

### Problem: Port 5001 je zauzet
```bash
# Proverite koji proces koristi port 5001
lsof -i :5001

# Zaustavite proces ili promenite port
PORT=5002 npm run dev
```

### Problem: Baza podataka nije kreirana
```bash
# Proverite da li postoji database.sqlite fajl
ls -la backend/database.sqlite

# Ako ne postoji, restartujte server
npm run dev
```

### Problem: CORS greške
```bash
# Proverite da li je CORS omogućen u server.js
# Trebalo bi da vidite: app.use(cors());
```

### Problem: SQLite greške
```bash
# Proverite da li je sqlite3 instaliran
npm list sqlite3

# Ako nije, reinstalirajte
npm install sqlite3
```

## ✅ Provera da li sve radi

### 1. Backend server
- ✅ Port 5000 je slobodan
- ✅ Server se pokreće bez grešaka
- ✅ Health check endpoint radi

### 2. SQL baza
- ✅ database.sqlite fajl je kreiran
- ✅ Tabele su kreirane
- ✅ Sample podaci su učitani

### 3. API endpoints
- ✅ GET /api/materials radi
- ✅ GET /api/employees radi
- ✅ GET /api/stats/overview radi

### 4. Frontend integracija
- ✅ Frontend može da pristupi backend-u
- ✅ API pozivi rade
- ✅ Podaci se učitavaju

## 🎯 Sledeći koraci

1. **Pokrenite frontend** u novom terminal-u:
   ```bash
   cd ..  # Vratite se u root folder
   npm start
   ```

2. **Testirajte aplikaciju** na `http://localhost:3000`

3. **Proverite da li se podaci učitavaju** iz SQL baze

4. **Implementirajte refaktorisanje** frontend-a da koristi API

## 📞 Podrška

Ako imate problema:
1. Proverite da li su svi preduvjeti ispunjeni
2. Proverite console output za greške
3. Proverite da li su portovi slobodni
4. Otvorite issue na GitHub-u

---

**Napomena**: Backend server mora biti pokrenut da bi frontend radio sa SQL bazom podataka.
