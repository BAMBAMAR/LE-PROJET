@echo off
title Changer de Compte Facebook - Revue de Presse
echo ===================================================
echo   CHANGEMENT DE COMPTE FACEBOOK
echo ===================================================
echo.
echo Reinitialisation de la session et ouverture du navigateur...
echo Connectez-vous avec votre nouveau compte.
echo.

cd /d "%~dp0"
node scripts/fb-login-setup.js --reset

echo.
echo ===================================================
echo   APPUYEZ SUR UNE TOUCHE POUR FERMER
echo ===================================================
pause
