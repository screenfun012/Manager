#!/bin/bash

# Script za build kompletne aplikacije sa automatskim pokretanjem backend servera

echo "🏗️ Building kompletna Potrošni Materijal aplikacija..."

# Build frontend
echo "📦 Building frontend..."
npm run build

# Build Tauri aplikaciju
echo "🦀 Building Tauri aplikaciju..."
npm run tauri build

# Kopiraj backend folder u bundle
echo "📁 Kopiram backend folder..."
BACKEND_SOURCE="backend"
BUNDLE_BACKEND="src-tauri/target/release/bundle/macos/Potrosni Materijal.app/Contents/Resources/backend"

if [ -d "$BACKEND_SOURCE" ]; then
    cp -r "$BACKEND_SOURCE" "$BUNDLE_BACKEND"
    echo "✅ Backend folder kopiran u bundle"
else
    echo "❌ Backend folder nije pronađen"
    exit 1
fi

# Kreiraj launcher aplikaciju
echo "🚀 Kreiram launcher aplikaciju..."
LAUNCHER_DIR="src-tauri/target/release/bundle/macos/Potrosni_Materijal_Launcher.app"
mkdir -p "$LAUNCHER_DIR/Contents/MacOS"
mkdir -p "$LAUNCHER_DIR/Contents/Resources"

# Kopiraj launcher script
cp "Potrosni_Materijal_Launcher.app/Contents/MacOS/launcher" "$LAUNCHER_DIR/Contents/MacOS/"
cp "Potrosni_Materijal_Launcher.app/Contents/Info.plist" "$LAUNCHER_DIR/Contents/"
chmod +x "$LAUNCHER_DIR/Contents/MacOS/launcher"

# Kopiraj glavnu aplikaciju u Resources
cp -r "src-tauri/target/release/bundle/macos/Potrosni Materijal.app" "$LAUNCHER_DIR/Contents/Resources/"

# Kreiraj DMG sa launcher-om
echo "📀 Kreiram DMG sa launcher-om..."
DMG_NAME="Potrosni_Materijal_COMPLETE_$(date +%Y%m%d_%H%M%S).dmg"

hdiutil create -volname "Potrošni Materijal" -srcfolder "$LAUNCHER_DIR" -ov -format UDZO "$DMG_NAME"

echo "✅ Kompletna aplikacija kreirana: $DMG_NAME"
echo ""
echo "📋 Instrukcije za krajnje korisnike:"
echo "1. Instalirajte $DMG_NAME"
echo "2. Pokrenite 'Potrošni Materijal' aplikaciju"
echo "3. Backend server će se automatski pokrenuti"
echo "4. Aplikacija će se otvoriti sa vašim podacima"
