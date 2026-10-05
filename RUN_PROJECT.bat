@echo off
title KeyPrime Sales Management Launcher
cd /d "%~dp0"
echo ========================================================
echo   Launching KeyPrime Sales Management App...
echo ========================================================
start "KeyPrime Backend Server (Port 5000)" cmd /k "cd /d "%~dp0backend" && node src/index.js"
timeout /t 2 /nobreak >nul
start "KeyPrime Expo App (Port 8081)" cmd /k "cd /d "%~dp0" && call npx expo start -c"
echo.
echo ========================================================
echo  Both Backend Server and Expo App are now running!
echo  1. Scan the QR code with Expo Go on your Android phone.
echo  2. Or press 'w' in the Expo window to open in Browser.
echo ========================================================
echo.
pause
