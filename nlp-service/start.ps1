$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = Join-Path $root "venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
  throw "Khong tim thay Python trong venv: $python"
}

Push-Location $root
try {
  & $python -m uvicorn main:app --reload --host 0.0.0.0 --port 5002
} finally {
  Pop-Location
}
