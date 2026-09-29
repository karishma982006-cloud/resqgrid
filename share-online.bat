@echo off
echo ========================================================
echo   RESQ-GRID — Public Online Tunnel Launcher
echo   Shares your project to the public internet
echo ========================================================
echo.
echo Make sure RESQ-GRID backend is running on port 5000.
echo.
:loop
cmd /c "npx localtunnel --port 5000"
echo.
echo Tunnel closed or disconnected. Reconnecting in 3 seconds...
timeout /t 3 >nul
goto loop
