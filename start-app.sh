#!/bin/bash

# Script za pokretanje backend servera i desktop aplikacije

echo "🚀 Pokretanje Potrošni Materijal aplikacije..."

# Proveri da li je backend server već pokrenut
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend server već radi na portu 5001"
else
    echo "🔄 Pokretanje backend servera..."
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
    
    # Čekaj da se backend server pokrene
    echo "⏳ Čekam da se backend server pokrene..."
    for i in {1..10}; do
        if curl -s http://localhost:5001/api/health > /dev/null; then
            echo "✅ Backend server uspešno pokrenut!"
            break
        fi
        echo "   Pokušavam $i/10..."
        sleep 2
    done
fi

# Pokreni desktop aplikaciju
echo "🖥️ Pokretanje desktop aplikacije..."
npm run tauri dev

# Kada se aplikacija zatvori, zaustavi backend server
if [ ! -z "$BACKEND_PID" ]; then
    echo "🛑 Zaustavljam backend server..."
    kill $BACKEND_PID
fi
