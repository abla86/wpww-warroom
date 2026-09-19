#!/usr/bin/env bash
echo "==================================================="
echo " WPWW WarRoom // Offline Portable Launcher"
echo "==================================================="
echo "Starter lokal offline-server..."

if command -v npx >/dev/null 2>&1; then
    echo "[OK] npx funnet. Åpner nettleser og starter via 'npx serve dist'..."
    (sleep 1 && (open "http://localhost:3000" 2>/dev/null || xdg-open "http://localhost:3000" 2>/dev/null)) &
    npx serve dist -l 3000
    exit 0
elif command -v python3 >/dev/null 2>&1; then
    echo "[OK] python3 funnet. Åpner nettleser og starter server..."
    cd dist || exit 1
    (sleep 1 && (open "http://localhost:3000" 2>/dev/null || xdg-open "http://localhost:3000" 2>/dev/null)) &
    python3 -m http.server 3000
    exit 0
elif command -v python >/dev/null 2>&1; then
    echo "[OK] python funnet. Åpner nettleser og starter server..."
    cd dist || exit 1
    (sleep 1 && (open "http://localhost:3000" 2>/dev/null || xdg-open "http://localhost:3000" 2>/dev/null)) &
    python -m http.server 3000
    exit 0
else
    echo "[FEIL] Verken Node (npx) eller Python ble funnet på maskinen."
    echo "Installer Node.js eller Python for å kjøre direkte fra minnepinne."
    exit 1
fi
