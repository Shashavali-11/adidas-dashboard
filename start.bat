@echo off
cd /d "%~dp0"
if not exist node_modules\concurrently (
  echo Installing dependencies - first run only...
  call npm run setup || exit /b 1
)
echo Starting Adidas dashboard. Open http://localhost:5173 once the API is ready.
call npm start
