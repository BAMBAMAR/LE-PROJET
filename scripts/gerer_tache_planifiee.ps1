# scripts/gerer_tache_planifiee.ps1
# Gestionnaire de tâche planifiée Windows pour la Revue de Presse automatisée

param (
    [ValidateSet('creer', 'creer-engagements', 'lancer', 'lancer-engagements', 'status', 'logs', 'follow', 'supprimer')]
    [string]$Action = 'status',
    [string]$Heure = '08:00',
    [string]$Target = 'tous'
)

$ProjectPath = Split-Path -Parent $PSScriptRoot
$BatPath = Join-Path $ProjectPath "run_daily.bat"
$BatEngagements = Join-Path $ProjectPath "mettre_a_jour_engagements.bat"
$TaskName = "Projet_Revue_De_Presse"
$TaskEngagementsName = "Projet_Mise_A_Jour_Engagements"
$LogPath = Join-Path $ProjectPath "daily_run.log"

switch ($Action) {
    'creer' {
        Write-Host "Configuration de la tâche planifiée principale $TaskName (Revue + Engagements à $Heure)..." -ForegroundColor Cyan
        $TaskAction = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"`"$BatPath`"`"" -WorkingDirectory $ProjectPath
        $Trigger = New-ScheduledTaskTrigger -Daily -At $Heure
        $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
        Register-ScheduledTask -TaskName $TaskName -Action $TaskAction -Trigger $Trigger -Settings $Settings -Force | Out-Null
        Write-Host "✅ Tâche $TaskName enregistrée avec succès !" -ForegroundColor Green
        Write-Host "   -> Exécution quotidienne à $Heure (Revue de presse + Mise à jour des engagements)." -ForegroundColor Yellow
    }
    'creer-engagements' {
        Write-Host "Configuration de la tâche planifiée dédiée $TaskEngagementsName (tous les jours à $Heure)..." -ForegroundColor Cyan
        $TaskAction = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"`"$BatEngagements`"`"" -WorkingDirectory $ProjectPath
        $Trigger = New-ScheduledTaskTrigger -Daily -At $Heure
        $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
        Register-ScheduledTask -TaskName $TaskEngagementsName -Action $TaskAction -Trigger $Trigger -Settings $Settings -Force | Out-Null
        Write-Host "✅ Tâche $TaskEngagementsName enregistrée avec succès !" -ForegroundColor Green
        Write-Host "   -> Exécution quotidienne planifiée à $Heure." -ForegroundColor Yellow
    }
    'lancer' {
        Write-Host "Lancement immédiat de la tâche principale en arrière-plan (Task Scheduler)..." -ForegroundColor Cyan
        Start-Process schtasks -ArgumentList "/Run /TN `"$TaskName`"" -NoNewWindow -Wait
        Write-Host "🚀 Tâche lancée ! Vous pouvez suivre les logs avec l'option 5 ou consulter daily_run.log." -ForegroundColor Green
    }
    'lancer-engagements' {
        Write-Host "Lancement immédiat de la tâche engagements en arrière-plan..." -ForegroundColor Cyan
        Start-Process schtasks -ArgumentList "/Run /TN `"$TaskEngagementsName`"" -NoNewWindow -Wait
        Write-Host "🚀 Tâche des engagements lancée !" -ForegroundColor Green
    }
    'status' {
        Write-Host "=== État de la tâche planifiée principale : $TaskName ===" -ForegroundColor Cyan
        schtasks /Query /TN $TaskName /FO LIST /V 2>$null
        Write-Host "`n=== État de la tâche dédiée aux engagements : $TaskEngagementsName ===" -ForegroundColor Cyan
        schtasks /Query /TN $TaskEngagementsName /FO LIST /V 2>$null
    }
    'logs' {
        if (Test-Path $LogPath) {
            Write-Host "=== Dernières lignes de logs ($LogPath) ===" -ForegroundColor Cyan
            Get-Content $LogPath -Tail 40
        } else {
            Write-Host "Aucun log trouvé pour le moment ($LogPath)." -ForegroundColor Yellow
        }
    }
    'follow' {
        if (Test-Path $LogPath) {
            Write-Host "=== Suivi en direct du fichier journal ($LogPath) ===" -ForegroundColor Cyan
            Write-Host "(Appuyez sur Ctrl + C pour quitter le suivi)" -ForegroundColor Yellow
            Get-Content $LogPath -Tail 20 -Wait
        } else {
            Write-Host "Aucun log trouvé ($LogPath). Lancez une exécution d'abord." -ForegroundColor Yellow
        }
    }
    'supprimer' {
        Write-Host "Suppression des tâches planifiées ProjetBI..." -ForegroundColor Red
        schtasks /Delete /TN $TaskName /F 2>$null
        schtasks /Delete /TN $TaskEngagementsName /F 2>$null
        Write-Host "✅ Tâches supprimées." -ForegroundColor Green
    }
}
