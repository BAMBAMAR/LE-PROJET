@echo off
title Gestionnaire d'Automatisations - ProjetBI
cd /d "%~dp0"

:menu
cls
echo ===================================================
echo   GESTIONNAIRE D'AUTOMATISATIONS - PROJETBI
echo ===================================================
echo.
echo  --- EXECUTIONS DIRECTES ---
echo  [1] Lancer TOUT en direct (Revue de presse + Engagements)
echo  [2] Lancer la REVUE DE PRESSE en direct
echo  [3] Lancer la MISE A JOUR DES ENGAGEMENTS en direct
echo.
echo  --- PLANIFICATEUR DE TACHES WINDOWS ---
echo  [4] Voir le STATUT des taches planifiees (Task Scheduler)
echo  [5] Declencher la tache principale en arriere-plan
echo  [6] Declencher la tache des engagements en arriere-plan
echo  [7] Configurer / Modifier l'heure d'execution quotidienne
echo  [8] Supprimer les taches planifiees
echo.
echo  --- LOGS ET SUIVI ---
echo  [9] Consulter les derniers logs d'execution
echo  [10] Suivre les logs en direct (temps reel)
echo  [11] Quitter
echo.
echo ===================================================
set /p choix="Votre choix (1-11) : "

if "%choix%"=="1" goto direct_all
if "%choix%"=="2" goto direct_revue
if "%choix%"=="3" goto direct_eng
if "%choix%"=="4" goto status
if "%choix%"=="5" goto lancer_all
if "%choix%"=="6" goto lancer_eng
if "%choix%"=="7" goto modifier
if "%choix%"=="8" goto supprimer
if "%choix%"=="9" goto logs
if "%choix%"=="10" goto follow
if "%choix%"=="11" goto fin
goto menu

:direct_all
cls
call run_daily.bat
echo.
pause
goto menu

:direct_revue
cls
call run_daily_revue.bat
echo.
pause
goto menu

:direct_eng
cls
call mettre_a_jour_engagements.bat
echo.
pause
goto menu

:status
cls
powershell -ExecutionPolicy Bypass -File scripts\gerer_tache_planifiee.ps1 -Action status
echo.
pause
goto menu

:lancer_all
cls
powershell -ExecutionPolicy Bypass -File scripts\gerer_tache_planifiee.ps1 -Action lancer
echo.
pause
goto menu

:lancer_eng
cls
powershell -ExecutionPolicy Bypass -File scripts\gerer_tache_planifiee.ps1 -Action lancer-engagements
echo.
pause
goto menu

:modifier
cls
echo Entrez la nouvelle heure au format HH:mm (exemple: 07:30 ou 08:30)
set /p newHeure="Nouvelle heure pour les taches quotidiennes : "
if "%newHeure%"=="" set newHeure=08:00
powershell -ExecutionPolicy Bypass -File scripts\gerer_tache_planifiee.ps1 -Action creer -Heure %newHeure%
powershell -ExecutionPolicy Bypass -File scripts\gerer_tache_planifiee.ps1 -Action creer-engagements -Heure %newHeure%
echo.
pause
goto menu

:supprimer
cls
powershell -ExecutionPolicy Bypass -File scripts\gerer_tache_planifiee.ps1 -Action supprimer
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

:fin
exit
