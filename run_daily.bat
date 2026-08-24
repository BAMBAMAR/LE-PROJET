@echo off
cd /d "c:\Users\bamba\Downloads\LE-PROJET-main\LE-PROJET-main"
echo %date% %time% : Lancement du telechargement de la revue de presse... >> daily_run.log
node scripts/download_revue.js >> daily_run.log 2>&1
echo %date% %time% : Fin de la tache. >> daily_run.log
