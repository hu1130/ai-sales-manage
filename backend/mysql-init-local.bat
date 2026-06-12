@echo off
set "MYSQL_HOME=C:\Program Files\MySQL\MySQL Server 8.0"
set "DATA_DIR=%~dp0.mysql-data"

if exist "%DATA_DIR%\auto.cnf" (
  echo Local MySQL data directory already exists:
  echo %DATA_DIR%
  echo.
  echo Nothing to initialize.
  exit /b 0
)

mkdir "%DATA_DIR%" 2>nul
"%MYSQL_HOME%\bin\mysqld.exe" --no-defaults --initialize-insecure --basedir="%MYSQL_HOME%" --datadir="%DATA_DIR%"

if errorlevel 1 (
  echo Failed to initialize local MySQL data directory.
  exit /b 1
)

if exist "%DATA_DIR%\undo_001" move "%DATA_DIR%\undo_001" "%DATA_DIR%\undo_001.init.bak" >nul
if exist "%DATA_DIR%\undo_002" move "%DATA_DIR%\undo_002" "%DATA_DIR%\undo_002.init.bak" >nul

echo Local MySQL data directory initialized:
echo %DATA_DIR%
echo.
echo Root user has no password for this local project instance.
