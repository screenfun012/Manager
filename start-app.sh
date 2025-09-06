#!/bin/bash

# Potrosni Materijal - Standalone Web Application
# Ova skripta pokreće aplikaciju kao web server

echo "🚀 Pokretanje Potrosni Materijal aplikacije..."

# Pronađi direktorijum skripte
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Proveri da li je Node.js instaliran
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nije instaliran!"
    echo "Molimo instalirajte Node.js sa https://nodejs.org/"
    exit 1
fi

# Proveri da li je npm instaliran
if ! command -v npm &> /dev/null; then
    echo "❌ npm nije instaliran!"
    echo "Molimo instalirajte npm sa https://nodejs.org/"
    exit 1
fi

# Instaliraj dependencies ako nisu instalirani
if [ ! -d "node_modules" ]; then
    echo "📦 Instaliranje dependencies..."
    npm install
fi

# Pokreni backend server u pozadini
echo "🔧 Pokretanje backend servera..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Instaliranje backend dependencies..."
    npm install
fi
node server.js &
BACKEND_PID=$!
cd ..

# Sačekaj da se backend pokrene
echo "⏳ Čekanje da se backend server pokrene..."
sleep 3

# Pokreni frontend server
echo "🌐 Pokretanje frontend servera..."
npm start

# Kada se frontend zatvori, zaustavi backend
echo "🛑 Zaustavljanje backend servera..."
kill $BACKEND_PID 2>/dev/null

echo "✅ Aplikacija je zatvorena."
