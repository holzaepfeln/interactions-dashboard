@echo off
title Interactions Dashboard
echo Starting Interactions Dashboard...
echo.
echo Once you see "Ready", open http://localhost:3000 in your browser.
echo Press Ctrl+C to stop the server.
echo.

cd /d "C:\Users\holza\Desktop\Side Projects\interactions-dashboard"

:: Open browser after a short delay
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

:: Start the dev server
call npx next dev --port 3000
