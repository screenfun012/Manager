#!/bin/bash

# Build script za kreiranje finalne release verzije

echo "🚀 Building Potrošni Materijal - Release Version"

# Proveri da li su svi potrebni fajlovi prisutni
if [ ! -d "src" ]; then
    echo "❌ src folder nije pronađen!"
    exit 1
fi

if [ ! -d "backend" ]; then
    echo "❌ backend folder nije pronađen!"
    exit 1
fi

if [ ! -d "src-tauri" ]; then
    echo "❌ src-tauri folder nije pronađen!"
    exit 1
fi

echo "✅ Svi potrebni fajlovi su prisutni"

# Instaliraj dependencies
echo "📦 Instaliranje dependencies..."
npm install

echo "📦 Instaliranje backend dependencies..."
cd backend && npm install && cd ..

# Build aplikacije
echo "🏗️ Building aplikacije..."
./build-complete-app.sh

echo "✅ Build završen!"
echo ""
echo "📋 Rezultat:"
echo "- DMG fajl: Potrosni_Materijal_COMPLETE_*.dmg"
echo "- Launcher: Potrosni_Materijal_Launcher.app"
echo "- Glavna aplikacija: Potrosni Materijal.app"
echo ""
echo "🎯 Sada možete:"
echo "1. Testirati DMG fajl"
echo "2. Kreirati GitHub release"
echo "3. Distribuirati aplikaciju"
