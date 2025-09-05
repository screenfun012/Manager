# 🌐 WEB DISTRIBUCIJA APLIKACIJE ZA POTROŠNI MATERIJAL

## 📦 Šta je kreirano

### Web Aplikacija (RADI!)
- **Production Build**: `build/` folder (6.2MB)
- **Optimizovan**: Gzip kompresija, tree shaking, code splitting
- **Testirano**: Radi na localhost:3001

## 🖥️ Instalacija na macOS

### Opcija 1: Web verzija (PREPORUČENO)
```bash
# 1. Kopirajte build folder na drugi računar
scp -r build/ korisnik@racunar:/putanja/do/foldera/

# 2. Na drugom računaru, instalirajte web server
npm install -g serve

# 3. Pokrenite aplikaciju
serve -s build -p 3000

# 4. Otvorite u browser-u
open http://localhost:3000
```

### Opcija 2: Direktno pokretanje
```bash
# 1. Kopirajte build folder
cp -r build/ /Applications/potrosni-materijal-web/

# 2. Instalirajte serve globalno
sudo npm install -g serve

# 3. Pokrenite aplikaciju
serve -s /Applications/potrosni-materijal-web/build -p 3000
```

## 🌐 Instalacija na drugi računar

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

### Web Build
```bash
# Kreirajte production build
npm run build

# Testirajte lokalno
npx serve -s build -p 3001
```

## 📊 Veličine

| Komponenta | Veličina | Opis |
|------------|----------|------|
| **Source Code** | 3.6GB | Razvojna verzija sa node_modules |
| **Production Build** | 6.2MB | Optimizovan web build |
| **Web Server** | ~50MB | serve paket |

## 🎯 Prednosti Web verzije

1. **Mala veličina** - 6.2MB vs 3.6GB (98% manje!)
2. **Jednostavna instalacija** - Samo kopiranje foldera
3. **Kreiranje desktop shortcut-a** - Moguće
4. **Offline funkcionalnost** - Service Worker
5. **Cross-platform** - Radi na svim operativnim sistemima

## 🚨 Napomene

- **Backend server** mora biti pokrenut na portu 5001
- **Database** se kreira automatski u `backend/` folderu
- **Portovi**: Frontend 3000, Backend 5001
- **Browser**: Moderni browser (Chrome, Firefox, Safari, Edge)

## 🔄 Update proces

1. Napravite promene u kodu
2. `npm run build` - Kreirajte novi web build
3. Kopirajte novi build folder na drugi računar
4. Restartujte web server

## 🖥️ Kreiranje Desktop Shortcut-a

### macOS
```bash
# 1. Otvorite Automator
# 2. Kreirajte novi Quick Action
# 3. Dodajte "Run Shell Script" akciju
# 4. Unesite: serve -s /putanja/do/build -p 3000
# 5. Sačuvajte kao aplikaciju
```

### Windows
```bash
# 1. Kreirajte .bat fajl
echo @echo off > start-app.bat
echo cd /d "C:\putanja\do\build" >> start-app.bat
echo serve -s . -p 3000 >> start-app.bat
echo pause >> start-app.bat

# 2. Kreirajte shortcut za .bat fajl
# 3. Postavite "Run as administrator" ako je potrebno
```

---

**🎉 Vaša web aplikacija je sada spremna za distribuciju i radi savršeno!**

## 🚀 Brzi start

```bash
# 1. Kopirajte build folder
cp -r build/ /Applications/potrosni-materijal/

# 2. Pokrenite aplikaciju
cd /Applications/potrosni-materijal
npx serve -s build -p 3000

# 3. Otvorite u browser-u
open http://localhost:3000
```
