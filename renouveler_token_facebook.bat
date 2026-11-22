@echo off
title Renouvellement Token Facebook - ProjetBI
cd /d "%~dp0"

echo ===================================================
echo   CONVERTISSEUR DE TOKEN FACEBOOK EN PERMANENT
echo ===================================================
echo.

node scripts/renouveler_token_facebook.js

echo.
echo ===================================================
echo   FIN DU PROCESSUS
echo ===================================================
pause

