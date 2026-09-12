@echo off
title Connexion Facebook - Scraping Annonces
echo ===================================================
echo   SESSION FACEBOOK DEDIEE AUX ANNONCES (CHROME)
echo ===================================================
echo.
echo Ce script ouvre une session separee (.fb_session_annonces)
echo sans impacter la session de la revue de presse ni d'autres projets.
echo.

cd /d "%~dp0"
node scripts/fb-login-setup.js --annonces --chrome %*

echo.
echo ===================================================
echo   APPUYEZ SUR UNE TOUCHE POUR FERMER
echo ===================================================
pause
