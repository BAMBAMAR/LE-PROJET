@echo off
title Mise a jour Revue de Presse - ProjetBI
echo ===================================================
echo   MISE A JOUR MANUELLE DE LA REVUE DE PRESSE
echo ===================================================
echo.

cd /d "%~dp0"
node scripts/manual_update_press.js %*

echo.
echo ===================================================
echo   OPERATION TERMINEE - APPUYEZ SUR UNE TOUCHE
echo ===================================================
pause
