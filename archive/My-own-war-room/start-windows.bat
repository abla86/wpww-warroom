@echo off
echo ===================================================
echo  WPWW WarRoom // Offline Portable Launcher
echo ===================================================
echo Starter lokal offline-server fra minnepinne...
echo.

where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Node/npx funnet. Starter via 'npx serve dist'...
    start http://localhost:3000
    npx serve dist -l 3000
    goto end
)

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Python funnet. Starter via 'python -m http.server'...
    cd dist
    start http://localhost:3000
    python -m http.server 3000
    goto end
)

where python3 >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Python3 funnet. Starter via 'python3 -m http.server'...
    cd dist
    start http://localhost:3000
    python3 -m http.server 3000
    goto end
)

echo [FEIL] Verken Node (npx) eller Python ble funnet pa maskinen.
echo Vennligst installer Node.js (https://nodejs.org) eller Python for a kjore fra minnepinne.
pause

:end
