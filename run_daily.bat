@echo off
cd /d "%~dp0"
echo =================================================== >> daily_run.log
echo [%date% %time%] Lancement de la revue de presse... >> daily_run.log
node scripts/download_revue.js %* >> daily_run.log 2>&1
echo [%date% %time%] Fin de la tache avec code %errorlevel%. >> daily_run.log
