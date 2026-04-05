$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$python = Join-Path $root "venv\Scripts\python.exe"
$requirements = Join-Path $root "requirements.txt"

if (-not (Test-Path $python)) {
  throw "Khong tim thay Python trong venv: $python"
}

if (-not (Test-Path $requirements)) {
  throw "Khong tim thay requirements.txt: $requirements"
}

Push-Location $root
try {
  & $python -m pip install -r $requirements
} finally {
  Pop-Location
}
