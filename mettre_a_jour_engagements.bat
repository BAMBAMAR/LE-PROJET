@echo off
title Mise a jour des Engagements - ProjetBI
echo ===================================================
echo   MISE A JOUR DES ENGAGEMENTS ET ACTUALITES (PROJETBI)
echo ===================================================
echo.

cd /d "%~dp0"
node scripts/update_promises_from_actualites.js %*

echo.
echo ===================================================
echo   OPERATION TERMINEE
echo ===================================================
echo Fermeture automatique dans 10 secondes (ou appuyez sur une touche)...
timeout /t 10 >nul 2>&1 || pause

