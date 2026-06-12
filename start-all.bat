@echo off
set "ROOT=%~dp0"

start "AI Sales Backend" cmd /k pushd "%ROOT%backend" ^&^& npm start
start "AI Sales Frontend" cmd /k pushd "%ROOT%frontend" ^&^& npm run serve

echo Backend:  http://localhost:3001
echo Frontend: http://localhost:8081
echo.
echo Login: admin / admin123
