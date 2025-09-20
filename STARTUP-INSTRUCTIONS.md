# 🚀 Uputstva za pokretanje aplikacije

## 📋 Za razvoj (Development)

### macOS/Linux:
```bash
./start-app.sh
```

### Windows:
```cmd
start-app.bat
```

## 🏗️ Za build (Production)

### macOS/Linux:
```bash
./build-with-backend.sh
```

### Windows:
```cmd
npm run build
npm run tauri build
```

## 🎯 Kako radi automatsko pokretanje:

1. **Script proverava** da li backend server već radi na portu 5001
2. **Ako ne radi**, pokreće `npm start` u backend folderu
3. **Čeka** da se server pokrene (do 20 sekundi)
4. **Pokreće desktop aplikaciju**
5. **Kada se aplikacija zatvori**, zaustavlja backend server

## 🔧 Ručno pokretanje (ako script ne radi):

1. Otvorite terminal u backend folderu
2. Pokrenite: `npm start`
3. Otvorite novi terminal u root folderu
4. Pokrenite: `npm run tauri dev`

## ⚠️ Napomene:

- Backend server se pokreće na portu **5001**
- Aplikacija će koristiti fallback podatke ako se backend ne može povezati
- Za production, koristite build script-ove za optimalnu performansu
