@echo off
title Gestionnaire Visuel Revue de Presse - ProjetBI
echo ===================================================
echo   GESTIONNAIRE VISUEL DE LA REVUE DE PRESSE
echo ===================================================
echo.
echo Ouverture de la page dans votre navigateur...
echo (Laissez cette fenetre ouverte pendant que vous utilisez la page)
echo.

cd /d "%~dp0"
node scripts/press_manager_server.js

echo.
pause
