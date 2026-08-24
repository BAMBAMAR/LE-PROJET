@echo off
echo ===================================================
echo   LANCEMENT DE LA REVUE DE PRESSE AUTOMATISEE
echo ===================================================

cd /d "%~dp0"
node scripts/download_revue.js

echo ===================================================
echo   TERMINER - APPUYEZ SUR UNE TOUCHE POUR FERMER
echo ===================================================
pause
