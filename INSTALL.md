# Instalacija - Potrošni Materijal Desktop Aplikacija

## 🚀 Brza instalacija (Preporučeno)

### Za krajnje korisnike

1. **Skinite DMG fajl** `Potrosni_Materijal_COMPLETE_*.dmg`
2. **Otvortite DMG fajl** - Dvokliknite na njega
3. **Prevucite aplikaciju** u Applications folder
4. **Pokrenite aplikaciju** - Backend server se automatski pokreće!
5. **Koristite aplikaciju** - Sve je spremno za rad

### Šta se dešava automatski

- ✅ Backend server se pokreće na portu 5001
- ✅ SQLite baza se inicijalizuje
- ✅ Aplikacija se povezuje sa backend-om
- ✅ Vaši podaci se učitavaju
- ✅ Sve funkcionalnosti su dostupne

---

## 🛠️ Ručna instalacija (Za developere)

### Preduslovi

- **Node.js** (verzija 16 ili novija)
- **npm** ili **yarn**
- **Git**

### Koraci instalacije

1. **Klonirajte repository**:
   ```bash
   git clone https://github.com/your-username/potrosni-materijal.git
   cd potrosni-materijal
   ```

2. **Instalirajte frontend dependencies**:
   ```bash
   npm install
   ```

3. **Instalirajte backend dependencies**:
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Pokrenite aplikaciju**:
   ```bash
   ./build-complete-app.sh
   ```

### Alternativni način pokretanja

Ako ne želite da koristite build script:

1. **Pokrenite backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **U novom terminalu, pokrenite frontend**:
   ```bash
   npm run tauri dev
   ```

---

## 🔧 Build aplikacije

### Kreiranje DMG fajla

```bash
./build-complete-app.sh
```

Ovo će kreirati:
- Frontend build
- Tauri aplikaciju  
- Backend bundle
- Launcher aplikaciju
- Finalni DMG fajl

### Rezultat

- **DMG fajl**: `Potrosni_Materijal_COMPLETE_YYYYMMDD_HHMMSS.dmg`
- **Launcher aplikacija**: `Potrosni_Materijal_Launcher.app`
- **Glavna aplikacija**: `Potrosni Materijal.app`

---

## 🎯 Prvo pokretanje

### Šta očekivati

1. **Launcher se pokreće** - Pokreće backend server
2. **Backend server se inicijalizuje** - Kreira SQLite bazu
3. **Glavna aplikacija se otvara** - Desktop aplikacija
4. **Podaci se učitavaju** - Iz baze podataka

### Ako imate problema

1. **Proverite da li je port 5001 slobodan**:
   ```bash
   lsof -i:5001
   ```

2. **Proverite da li je Node.js instaliran**:
   ```bash
   node --version
   npm --version
   ```

3. **Restartujte aplikaciju**

---

## 📱 Funkcionalnosti

### Osnovne operacije

- **Dodavanje materijala** - Magacin tab
- **Zaduživanje radnika** - Zaduženja tab  
- **Pregled zaduženja** - Početna tab
- **Kalendar pregled** - Kalendar tab
- **Izvoz podataka** - Izvoz tab
- **Admin panel** - Admin tab

### Dashboard

- **Zeleni indikatori** - Datumi kada je materijal zadužen
- **Hover efekti** - Detalji o zaduženju
- **Editovanje** - Promena količine ili materijala
- **Vraćanje u magacin** - Klik na kantu

---

## 🆘 Rešavanje problema

### Backend server se ne pokreće

```bash
# Proverite da li je port zauzet
lsof -i:5001

# Zaustavite proces ako je potrebno
kill -9 <PID>

# Pokrenite backend ručno
cd backend && npm start
```

### Aplikacija se ne povezuje sa backend-om

1. **Proverite da li backend radi**: http://localhost:5001/api/health
2. **Restartujte aplikaciju**
3. **Proverite firewall postavke**

### Baza podataka je prazna

- **Normalno je** - Baza se kreira automatski
- **Dodajte materijale** u Magacin tab
- **Dodajte zaposlene** u Admin tab

---

## 📞 Podrška

Ako imate probleme:

1. **Proverite logove** u terminalu
2. **Restartujte aplikaciju**
3. **Kontaktirajte developera**

---

**Napravljeno sa ❤️ za efikasno upravljanje potrošnim materijalom**
