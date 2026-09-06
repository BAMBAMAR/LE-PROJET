# scripts/gerer_tache_planifiee.ps1
# Gestionnaire de tâche planifiée Windows pour la Revue de Presse automatisée

param (
    [ValidateSet('creer', 'lancer', 'status', 'logs', 'supprimer')]
    [string]$Action = 'status',
    [string]$Heure = '08:00'
)

$ProjectPath = Split-Path -Parent $PSScriptRoot
$BatPath = Join-Path $ProjectPath "run_daily.bat"
$TaskName = "Projet_Revue_De_Presse"
$LogPath = Join-Path $ProjectPath "daily_run.log"

switch ($Action) {
    'creer' {
        Write-Host "Configuration de la tâche planifiée $TaskName (tous les jours à $Heure)..." -ForegroundColor Cyan
        $TaskAction = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"`"$BatPath`"`"" -WorkingDirectory $ProjectPath
        $Trigger = New-ScheduledTaskTrigger -Daily -At $Heure
        $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
        Register-ScheduledTask -TaskName $TaskName -Action $TaskAction -Trigger $Trigger -Settings $Settings -Force | Out-Null
        Write-Host "✅ Tâche $TaskName enregistrée avec succès !" -ForegroundColor Green
        Write-Host "   -> Prochaine exécution quotidienne planifiée à $Heure." -ForegroundColor Yellow
        Write-Host "   -> Option 'Démarrer dès que possible' activée si le PC était éteint à l'heure prévue." -ForegroundColor Gray
    }
    'lancer' {
        Write-Host "Lancement immédiat de la tâche en arrière-plan..." -ForegroundColor Cyan
        Start-Process schtasks -ArgumentList "/Run /TN `"$TaskName`"" -NoNewWindow -Wait
        Write-Host "🚀 Tâche lancée ! Consultez le fichier daily_run.log pour suivre la progression." -ForegroundColor Green
    }
    'status' {
        Write-Host "=== État de la tâche planifiée $TaskName ===" -ForegroundColor Cyan
        schtasks /Query /TN $TaskName /FO LIST /V
    }
    'logs' {
        if (Test-Path $LogPath) {
            Write-Host "=== Dernières lignes de logs ($LogPath) ===" -ForegroundColor Cyan
            Get-Content $LogPath -Tail 40
        } else {
            Write-Host "Aucun log trouvé pour le moment ($LogPath)." -ForegroundColor Yellow
        }
    }
    'supprimer' {
        Write-Host "Suppression de la tâche $TaskName..." -ForegroundColor Red
        schtasks /Delete /TN $TaskName /F 2>$null
        Write-Host "✅ Tâche supprimée." -ForegroundColor Green
    }
}
