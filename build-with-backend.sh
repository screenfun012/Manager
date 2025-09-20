#!/bin/bash

# Script za build aplikacije sa backend serverom

echo "🏗️ Building Potrošni Materijal aplikacija sa backend serverom..."

# Build frontend
echo "📦 Building frontend..."
npm run build

# Build Tauri aplikaciju
echo "🦀 Building Tauri aplikaciju..."
npm run tauri build

echo "✅ Build završen!"
echo ""
echo "📁 Aplikacija je u src-tauri/target/release/bundle/"
echo "🚀 Za pokretanje koristite start-app.sh (macOS/Linux) ili start-app.bat (Windows)"
