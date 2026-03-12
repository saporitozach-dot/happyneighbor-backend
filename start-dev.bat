@echo off
cd /d "%~dp0"
echo Installing dependencies...
call npm install
if errorlevel 1 (
  echo npm install failed. Make sure Node.js is installed: https://nodejs.org
  pause
  exit /b 1
)
echo.
echo Starting dev server...
call npm run dev
pause
