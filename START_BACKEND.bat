@echo off
title KeyPrime Sales Backend Server
cd /d "%~dp0backend"
echo ========================================================
echo  Starting KeyPrime Sales Management API Server...
echo ========================================================
node src/index.js
pause
