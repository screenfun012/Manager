# 🚀 DISTRIBUCIJA APLIKACIJE ZA POTROŠNI MATERIJAL

## 📦 Šta je kreirano

### Tauri Desktop Aplikacija
- **macOS**: `src-tauri/target/release/bundle/macos/potrosni-materijal-app.app` (9.6MB)
- **DMG**: `src-tauri/target/release/bundle/dmg/potrosni-materijal-app_0.1.0_aarch64.dmg` (4.6MB)

### Web Aplikacija
- **Production Build**: `build/` folder (6.2MB)
- **Optimizovan**: Gzip kompresija, tree shaking, code splitting

## 🖥️ Instalacija na macOS

### Opcija 1: Direktno pokretanje
```bash
# Kopirajte .app folder u Applications
cp -r "src-tauri/target/release/bundle/macos/potrosni-materijal-app.app" /Applications/

# Pokrenite aplikaciju
open /Applications/potrosni-materijal-app.app
```

### Opcija 2: DMG instalacija
```bash
# Otvorite DMG fajl
open "src-tauri/target/release/bundle/dmg/potrosni-materijal-app_0.1.0_aarch64.dmg"

# Prevucite aplikaciju u Applications folder
# Zatvorite DMG i pokrenite aplikaciju
```

## 🌐 Instalacija na drugi računar (Web verzija)

### 1. Kopirajte build folder
```bash
# Kopirajte build folder na drugi računar
scp -r build/ korisnik@racunar:/putanja/do/foldera/
```

### 2. Instalirajte web server
```bash
# Na drugom računaru
npm install -g serve

# Pokrenite aplikaciju
serve -s build -p 3000
```

### 3. Otvorite u browser-u
```
http://localhost:3000
```

## 🔧 Kreiranje distribucije

### Tauri Build
```bash
# Instalirajte Tauri CLI
npm install @tauri-apps/cli

# Kreirajte distribuciju
npm exec tauri build
```

### Web Build
```bash
# Kreirajte production build
npm run build

# Testirajte lokalno
npm install -g serve
serve -s build
```

## 📊 Veličine

| Komponenta | Veličina | Opis |
|------------|----------|------|
| **Source Code** | 3.6GB | Razvojna verzija sa node_modules |
| **Production Build** | 6.2MB | Optimizovan web build |
| **Tauri macOS App** | 9.6MB | Desktop aplikacija |
| **Tauri DMG** | 4.6MB | Instalacioni fajl |

## 🎯 Prednosti Tauri

1. **Mala veličina** - 4.6MB vs 3.6GB
2. **Brza instalacija** - Jedan klik
3. **Desktop integracija** - Native macOS aplikacija
4. **Offline funkcionalnost** - Radi bez interneta
5. **Automatičke update-ovi** - Moguće implementirati

## 🚨 Napomene

- **Backend server** mora biti pokrenut na portu 5001
- **Database** se kreira automatski u `backend/` folderu
- **Portovi**: Frontend 3000, Backend 5001
- **Platforme**: Trenutno samo macOS, moguće dodati Windows/Linux

## 🔄 Update proces

1. Napravite promene u kodu
2. `npm run build` - Kreirajte novi web build
3. `npm exec tauri build` - Kreirajte novu Tauri distribuciju
4. Distribuirajte novi DMG fajl

---

**🎉 Vaša aplikacija je sada spremna za distribuciju!**
