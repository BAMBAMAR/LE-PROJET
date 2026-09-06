@echo off
title Connexion Facebook - Revue de Presse
echo ===================================================
echo   INITIALISATION DE LA SESSION FACEBOOK
echo ===================================================
echo.
echo Une fenetre de navigateur va s'ouvrir.
echo Connectez-vous a Facebook puis fermez le navigateur.
echo.

cd /d "%~dp0"
node scripts/fb-login-setup.js

echo.
echo ===================================================
echo   APPUYEZ SUR UNE TOUCHE POUR FERMER
echo ===================================================
pause
