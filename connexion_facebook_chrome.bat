@echo off
title Connexion Facebook - Google Chrome
echo ===================================================
echo   INITIALISATION SESSION FACEBOOK (GOOGLE CHROME)
echo ===================================================
echo.
echo Google Chrome va s'ouvrir.
echo Connectez-vous a votre compte Facebook, puis appuyez sur Entree ou fermez la fenetre.
echo.

cd /d "%~dp0"
node scripts/fb-login-setup.js --chrome %*

echo.
echo ===================================================
echo   APPUYEZ SUR UNE TOUCHE POUR FERMER
echo ===================================================
pause
