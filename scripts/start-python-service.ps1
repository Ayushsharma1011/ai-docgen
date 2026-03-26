$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$serviceDir = Join-Path $projectRoot "python-service"
$healthUrl = "http://localhost:8000/health"

try {
  $healthCheck = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -TimeoutSec 3
  if ($healthCheck.StatusCode -eq 200) {
    Write-Host "Python document service is already running at $healthUrl"
    exit 0
  }
} catch {
}

$venvPython = Join-Path $serviceDir "venv\Scripts\python.exe"

if (Test-Path $venvPython) {
  $pythonCommand = $venvPython
} else {
  $python = Get-Command python -ErrorAction SilentlyContinue
  if (-not $python) {
    throw "Python was not found. Install Python or create python-service\venv first."
  }

  $pythonCommand = $python.Source
}

Write-Host "Starting Python document service from $serviceDir"
Set-Location $serviceDir
& $pythonCommand -m uvicorn main:app --reload --port 8000
