@echo off
REM ============================================================
REM  David Balaish Architecture
REM  Double-click this file: it starts the server AND opens the
REM  site in your browser automatically. Keep this window open
REM  while the site is in use. Close it to stop the server.
REM ============================================================
title David Balaish - Server
cd /d "%~dp0server"
echo Starting David Balaish server...
echo.
echo   Website:  http://localhost:5500/
echo   Admin:    http://localhost:5500/admin.html
echo.
echo (close this window to stop the server)
start "" cmd /c "timeout /t 2 /nobreak >nul & start "" http://localhost:5500/index.html"
node server.js
pause
