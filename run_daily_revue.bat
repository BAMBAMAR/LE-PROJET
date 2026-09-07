@echo off
title Revue de Presse - ProjetBI (Suivi en direct)
cd /d "%~dp0"
echo ===================================================
echo   REVUE DE PRESSE AUTOMATISEE - PROJETBI
echo ===================================================
echo.
echo [%date% %time%] Demarrage du scraping en direct...
echo (Les logs sont simultanement enregistres dans daily_run.log)
echo.

node scripts/download_revue.js %*

echo.
echo ===================================================
echo   FIN DU TRAITEMENT (Code retour : %errorlevel%)
echo ===================================================
echo Appuyez sur une touche pour quitter...
pause >nul

