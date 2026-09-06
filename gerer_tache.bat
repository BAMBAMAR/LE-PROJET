@echo off
title Gestionnaire de Tache Planifiee - Revue de Presse
cd /d "%~dp0"

:menu
cls
echo ===================================================
echo   GESTIONNAIRE DE TACHE AUTOMATIQUE - REVUE DE PRESSE
echo ===================================================
echo.
echo  [1] Voir le statut de la tache planifiee
echo  [2] Lancer la tache maintenant (arriere-plan)
echo  [3] Consulter les logs d'execution
echo  [4] Modifier l'heure d'execution quotidienne
echo  [5] Supprimer la tache planifiee
echo  [6] Quitter
echo.
echo ===================================================
set /p choix="Votre choix (1-6) : "

if "%choix%"=="1" goto status
if "%choix%"=="2" goto lancer
if "%choix%"=="3" goto logs
if "%choix%"=="4" goto modifier
if "%choix%"=="5" goto supprimer
if "%choix%"=="6" goto fin
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
