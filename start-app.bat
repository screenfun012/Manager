@echo off
REM Potrosni Materijal - Standalone Web Application
REM Ova skripta pokreće aplikaciju kao web server

echo 🚀 Pokretanje Potrosni Materijal aplikacije...

REM Proveri da li je Node.js instaliran
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nije instaliran!
    echo Molimo instalirajte Node.js sa https://nodejs.org/
    pause
    exit /b 1
)

REM Proveri da li je npm instaliran
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm nije instaliran!
    echo Molimo instalirajte npm sa https://nodejs.org/
    pause
    exit /b 1
)

REM Instaliraj dependencies ako nisu instalirani
if not exist "node_modules" (
    echo 📦 Instaliranje dependencies...
    npm install
)

REM Pokreni backend server u pozadini
echo 🔧 Pokretanje backend servera...
cd backend
if not exist "node_modules" (
    echo 📦 Instaliranje backend dependencies...
    npm install
)
start /b node server.js
cd ..

REM Sačekaj da se backend pokrene
echo ⏳ Čekanje da se backend server pokrene...
timeout /t 3 /nobreak >nul

REM Pokreni frontend server
echo 🌐 Pokretanje frontend servera...
npm start

echo ✅ Aplikacija je zatvorena.
pause
