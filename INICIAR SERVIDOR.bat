@echo off
title EDUCIENCIA – Servidor local
color 0B

echo.
echo  =============================================
echo   EDUCIENCIA – Iniciando servidor local (Node.js)...
echo  =============================================
echo.

REM Matar cualquier proceso que ya ocupe el puerto 8080
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') DO (
    echo  Deteniendo proceso anterior en puerto 8080 (PID %%P)...
    taskkill /PID %%P /F >nul 2>&1
)

timeout /t 1 /nobreak >nul

echo  Iniciando servidor en http://localhost:8080
echo  Panel admin: http://localhost:8080/admin/
echo.
echo  Presiona Ctrl+C para detener el servidor.
echo  =============================================
echo.

cd /d "%~dp0"

REM Instalar dependencias si no existen
IF NOT EXIST node_modules (
    echo  Instalando dependencias (npm install)...
    call npm install
)

echo.
echo  Iniciando Node.js (npm start)...
call npm start

pause
