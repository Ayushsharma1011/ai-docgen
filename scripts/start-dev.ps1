$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$healthUrl = "http://localhost:8000/health"
$pythonScript = Join-Path $scriptDir "start-python-service.ps1"

$serviceRunning = $false

try {
  $healthCheck = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -TimeoutSec 3
  $serviceRunning = $healthCheck.StatusCode -eq 200
} catch {
  $serviceRunning = $false
}

if (-not $serviceRunning) {
  Write-Host "Opening Python document service in a separate PowerShell window..."
  Start-Process powershell.exe -WorkingDirectory $projectRoot -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-NoProfile",
    "-File", $pythonScript
  )

  Start-Sleep -Seconds 3
} else {
  Write-Host "Python document service is already running."
}

Write-Host "Starting Next.js dev server..."
Set-Location $projectRoot
npm run dev:web
