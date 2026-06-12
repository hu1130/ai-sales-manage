@echo off
set "MYSQL_HOME=C:\Program Files\MySQL\MySQL Server 8.0"
set "DATA_DIR=%~dp0.mysql-data"

if not exist "%DATA_DIR%\auto.cnf" (
  echo Local MySQL data directory is missing.
  echo Run mysql-init-local.bat first.
  exit /b 1
)

echo Starting local MySQL for this project...
echo Host: 127.0.0.1
echo Port: 3307
echo Data: %DATA_DIR%
echo.
pushd "%DATA_DIR%"
"%MYSQL_HOME%\bin\mysqld.exe" --no-defaults --basedir="%MYSQL_HOME%" --datadir="%DATA_DIR%" --port=3307 --mysqlx=0 --console
popd
