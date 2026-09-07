@echo off
title Revue de Presse - ProjetBI (Suivi en direct)
cd /d "%~dp0"
echo ===================================================
echo   REVUE DE PRESSE AUTOMATISEE - PROJETBI
echo ===================================================
echo.
echo [%date% %time%] Demarrage du scraping en direct...
echo (Les logs sont aussi enregistres dans daily_run.log)
echo.

node scripts/download_revue.js %*

echo.
echo ===================================================
echo   FIN DE LA TACHE (Code retour : %errorlevel%)
echo ===================================================
echo Fermeture automatique dans 15 secondes (ou appuyez sur une touche)...
timeout /t 15 >nul 2>&1 || pause

