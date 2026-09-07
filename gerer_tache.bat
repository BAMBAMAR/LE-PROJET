@echo off
title Gestionnaire de Revue de Presse - ProjetBI
cd /d "%~dp0"

:menu
cls
echo ===================================================
echo   GESTIONNAIRE DE REVUE DE PRESSE - PROJETBI
echo ===================================================
echo.
echo  [1] Lancer MAINTENANT avec AFFICHAGE EN DIRECT dans cette fenetre
echo  [2] Voir le statut de la tache planifiee Windows
echo  [3] Declencher la tache en arriere-plan (Task Scheduler)
echo  [4] Consulter les derniers logs d'execution
echo  [5] Suivre les logs en continu (temps reel)
echo  [6] Modifier l'heure d'execution quotidienne
echo  [7] Supprimer la tache planifiee
echo  [8] Quitter
echo.
echo ===================================================
set /p choix="Votre choix (1-8) : "

if "%choix%"=="1" goto direct
if "%choix%"=="2" goto status
if "%choix%"=="3" goto lancer
if "%choix%"=="4" goto logs
if "%choix%"=="5" goto follow
if "%choix%"=="6" goto modifier
if "%choix%"=="7" goto supprimer
if "%choix%"=="8" goto fin
goto menu

:direct
cls
call run_daily.bat
echo.
pause
goto menu

:status
cls
powershell -ExecutionPolicy Bypass -File scripts\gerer_tache_planifiee.ps1 -Action status
echo.
pause
goto menu

:lancer
cls
powershell -ExecutionPolicy Bypass -File scripts\gerer_tache_planifiee.ps1 -Action lancer
echo.
pause
goto menu

:logs
cls
powershell -ExecutionPolicy Bypass -File scripts\gerer_tache_planifiee.ps1 -Action logs
echo.
pause
goto menu

:follow
cls
powershell -ExecutionPolicy Bypass -File scripts\gerer_tache_planifiee.ps1 -Action follow
echo.
pause
goto menu

:modifier
cls
echo Entrez la nouvelle heure au format HH:mm (exemple: 07:30 ou 08:30)
set /p newHeure="Nouvelle heure : "
if "%newHeure%"=="" set newHeure=08:00
powershell -ExecutionPolicy Bypass -File scripts\gerer_tache_planifiee.ps1 -Action creer -Heure %newHeure%
echo.
pause
goto menu

:supprimer
cls
powershell -ExecutionPolicy Bypass -File scripts\gerer_tache_planifiee.ps1 -Action supprimer
echo.
pause
goto menu

:fin
exit
