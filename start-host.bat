@echo off
echo ========================================================
echo   RESQ-GRID UNIFIED HOSTING LAUNCHER
echo   Accessible from ALL Systems, Laptops, and Mobile Devices
echo ========================================================
echo.

cd /d "%~dp0backend"
echo [1/2] Launching RESQ-GRID Backend on 0.0.0.0:5000...
start "RESQ-GRID Backend (0.0.0.0:5000)" cmd /k "npm start"

timeout /t 2 /nobreak >nul

cd /d "%~dp0frontend"
echo [2/2] Launching RESQ-GRID Frontend on 0.0.0.0:5173...
start "RESQ-GRID Frontend (0.0.0.0:5173)" cmd /k "npm run dev"

echo.
echo ========================================================
echo   SERVERS STARTED SUCCESSFULLY!
echo.
echo   Connect from any device on your Wi-Fi/LAN:
echo   - Production App:   http://10.12.180.52:5000
echo   - Dev Hot-Reload:   http://10.12.180.52:5173
echo   - Local Browser:    http://localhost:5173
echo ========================================================
pause
