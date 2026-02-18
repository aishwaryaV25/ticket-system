@echo off
REM Stop containers

echo Stopping containers...
docker-compose down

echo ✓ All containers stopped
pause
