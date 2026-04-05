@echo off
setlocal
set ROOT=%~dp0
"%ROOT%venv\Scripts\python.exe" -m uvicorn main:app --reload --host 0.0.0.0 --port 5002
