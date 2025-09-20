@echo off
echo 🚀 Pokretanje Potrošni Materijal aplikacije...

REM Proveri da li je backend server već pokrenut
netstat -an | find "5001" | find "LISTENING" >nul
if %errorlevel% == 0 (
    echo ✅ Backend server već radi na portu 5001
) else (
    echo 🔄 Pokretanje backend servera...
    cd backend
    start /b npm start
    cd ..
    
    REM Čekaj da se backend server pokrene
    echo ⏳ Čekam da se backend server pokrene...
    for /l %%i in (1,1,10) do (
        curl -s http://localhost:5001/api/health >nul 2>&1
        if !errorlevel! == 0 (
            echo ✅ Backend server uspešno pokrenut!
            goto :server_ready
        )
        echo    Pokušavam %%i/10...
        timeout /t 2 /nobreak >nul
    )
    :server_ready
)

REM Pokreni desktop aplikaciju
echo 🖥️ Pokretanje desktop aplikacije...
npm run tauri dev

echo 🛑 Aplikacija zatvorena.
