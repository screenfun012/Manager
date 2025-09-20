# Potrošni Materijal - Desktop Aplikacija

Profesionalna desktop aplikacija za upravljanje potrošnim materijalom sa automatskim pokretanjem backend servera.

## 🚀 Funkcionalnosti

- **Upravljanje materijalima** - Dodavanje, uređivanje i brisanje materijala
- **Zaduživanje radnika** - Dodela materijala zaposlenima sa praćenjem datuma
- **Dashboard pregled** - Vizuelni prikaz zaduženja po datumima sa zelenim indikatorima
- **Magacin** - Praćenje stanja materijala u magacinu
- **Kalendar** - Pregled zaduženja po mesečima
- **Izvoz podataka** - Excel i Word izveštaji
- **Admin panel** - Statistike i upravljanje bazom podataka

## 🛠️ Tehnologije

- **Frontend**: React, Tauri
- **Backend**: Node.js, Express, SQLite
- **UI**: Lucide ikone, moderni dizajn
- **Platform**: macOS (Apple Silicon)

## 📦 Instalacija

### Automatska instalacija (Preporučeno)

1. **Skinite DMG fajl** iz [Releases](https://github.com/your-username/potrosni-materijal/releases)
2. **Instalirajte aplikaciju** - Backend server se automatski pokreće
3. **Pokrenite aplikaciju** - Sve radi automatski!

### Ručna instalacija (za developere)

1. **Klonirajte repo**:
   ```bash
   git clone https://github.com/your-username/potrosni-materijal.git
   cd potrosni-materijal
   ```

2. **Instalirajte dependencies**:
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Pokrenite aplikaciju**:
   ```bash
   ./build-complete-app.sh
   ```

## 🎯 Kako koristiti

### Osnovne operacije

1. **Dodavanje materijala**:
   - Idite na "Magacin" tab
   - Kliknite "Dodaj novi materijal"
   - Popunite formu i sačuvajte

2. **Zaduživanje radnika**:
   - Idite na "Zaduženja" tab
   - Kliknite "Zaduzi materijal"
   - Izaberite radnika i materijal
   - Unesite količinu i datum

3. **Pregled zaduženja**:
   - Idite na "Početna" tab
   - Vidite sve zaduženja sa zelenim indikatorima datuma
   - Kliknite na datum za detalje

### Dashboard funkcionalnosti

- **Zeleni pravougaonici** - Označavaju datume kada je materijal zadužen
- **Hover efekti** - Prikazuju detalje o zaduženju
- **Editovanje** - Kliknite na datum da promenite količinu ili materijal
- **Vraćanje u magacin** - Kliknite na kantu da vratite materijal

## 🔧 Build aplikacije

Za kreiranje finalne DMG aplikacije:

```bash
./build-complete-app.sh
```

Ovo će kreirati:
- Frontend build
- Tauri aplikaciju
- Backend bundle
- Launcher aplikaciju
- Finalni DMG fajl

## 📁 Struktura projekta

```
potrosni-materijal/
├── src/                    # React frontend
│   ├── components/         # UI komponente
│   ├── services/          # API servisi
│   └── App.js             # Glavna aplikacija
├── src-tauri/             # Tauri konfiguracija
├── backend/               # Node.js backend
│   ├── server.js          # Glavni server
│   └── database/          # SQLite baza
├── build-complete-app.sh  # Build script
└── Potrosni_Materijal_Launcher.app/  # Launcher aplikacija
```

## 🎨 UI/UX Features

- **Moderni dizajn** - Tamna tema sa plavim akcentima
- **Responsive layout** - Prilagođava se različitim veličinama
- **Intuitivna navigacija** - Jasni tabovi i dugmići
- **Vizuelni indikatori** - Zeleni pravougaonici za zaduženja
- **Hover efekti** - Interaktivni elementi

## 🔒 Bezbednost

- **Lokalna baza podataka** - SQLite za sigurno čuvanje podataka
- **Validacija podataka** - Provera unosa na frontend i backend
- **Error handling** - Elegantno rukovanje greškama

## 📊 Statistike

Aplikacija prati:
- Ukupan broj materijala
- Broj zaduženja po danu/mesecu
- Top materijale po korišćenju
- Statistike po odeljenjima
- Trendove korišćenja

## 🆘 Podrška

Ako imate probleme:

1. **Proverite da li je Node.js instaliran** (za ručnu instalaciju)
2. **Proverite da li je port 5001 slobodan**
3. **Restartujte aplikaciju**
4. **Kontaktirajte developera**

## 📝 Changelog

### v1.0.0 (2025-09-20)
- ✅ Automatsko pokretanje backend servera
- ✅ Zeleni indikatori za zaduženja
- ✅ Kompletna funkcionalnost dashboard-a
- ✅ Launcher aplikacija
- ✅ DMG distribucija

---

**Napravljeno sa ❤️ za efikasno upravljanje potrošnim materijalom**