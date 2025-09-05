#!/bin/bash

# 🚀 SETUP SKRIPTA ZA WEB APLIKACIJU ZA POTROŠNI MATERIJAL
# Ova skripta automatski postavlja aplikaciju na macOS

echo "🚀 Postavljam aplikaciju za potrošni materijal..."

# Kreiraj direktorijum u Applications
APP_DIR="/Applications/potrosni-materijal"
echo "📁 Kreiram direktorijum: $APP_DIR"

if [ -d "$APP_DIR" ]; then
    echo "⚠️  Direktorijum već postoji. Brisem stari..."
    rm -rf "$APP_DIR"
fi

mkdir -p "$APP_DIR"

# Kopiraj build folder
echo "📦 Kopiram aplikaciju..."
cp -r build/ "$APP_DIR/"

# Instaliraj serve globalno
echo "🔧 Instaliram web server..."
if command -v npm &> /dev/null; then
    echo "📦 npm je već instaliran"
else
    echo "❌ npm nije instaliran. Molimo instalirajte Node.js prvo."
    exit 1
fi

# Pokušaj da instaliraš serve globalno
if npm install -g serve 2>/dev/null; then
    echo "✅ serve je uspešno instaliran globalno"
else
    echo "⚠️  Ne mogu da instaliram serve globalno. Koristiću lokalnu verziju."
    cd "$APP_DIR"
    npm install serve
    cd - > /dev/null
fi

# Kreiraj start skriptu
echo "📝 Kreiram start skriptu..."
cat > "$APP_DIR/start-app.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Pokrećem aplikaciju za potrošni materijal..."
echo "🌐 Otvorite http://localhost:3000 u browser-u"
echo "⏹️  Pritisnite Ctrl+C za zaustavljanje"
echo ""
if command -v serve &> /dev/null; then
    serve -s build -p 3000
else
    npx serve -s build -p 3000
fi
EOF

# Učini start skriptu izvršnom
chmod +x "$APP_DIR/start-app.sh"

# Kreiraj desktop shortcut
echo "🖥️  Kreiram desktop shortcut..."
cat > "$APP_DIR/Potrosni Materijal.command" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
./start-app.sh
EOF

chmod +x "$APP_DIR/Potrosni Materijal.command"

# Kreiraj README
echo "📖 Kreiram README..."
cat > "$APP_DIR/README.txt" << 'EOF'
🚀 APLIKACIJA ZA POTROŠNI MATERIJAL

📱 Kako pokrenuti:
1. Dupli klik na "Potrosni Materijal.command"
2. Otvorite http://localhost:3000 u browser-u
3. Aplikacija će raditi dok je terminal otvoren

⚠️  VAŽNO: Backend server mora biti pokrenut na portu 5001!

🔧 Zaustavljanje:
- Zatvorite terminal prozor
- Ili pritisnite Ctrl+C u terminal-u

📁 Struktura:
- build/ - Aplikacija
- start-app.sh - Start skripta
- Potrosni Materijal.command - Desktop shortcut

🌐 Web aplikacija radi u browser-u i ima sve funkcionalnosti!
EOF

echo ""
echo "🎉 APLIKACIJA JE USPEŠNO POSTAVLJENA!"
echo ""
echo "📁 Lokacija: $APP_DIR"
echo "🚀 Pokretanje: Dupli klik na 'Potrosni Materijal.command'"
echo "🌐 URL: http://localhost:3000"
echo ""
echo "⚠️  NE ZABORAVITE da pokrenete backend server na portu 5001!"
echo "   cd backend && npm start"
echo ""
echo "📖 Pročitajte README.txt za više informacija"
