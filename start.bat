@echo off
REM Support Ticket System - Windows Quick Start Helper

echo.
echo 🚀 Support Ticket System - Docker Setup
echo ========================================
echo.

REM Check Docker installation
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed or not in PATH.
    echo Please install Docker from https://www.docker.com/
    pause
    exit /b 1
)

echo ✓ Docker is installed
echo.

REM Check .env file
if not exist .env (
    echo ⚠️  .env file not found. Creating from .env.example...
    copy .env.example .env
    echo ✓ Created .env file
    echo.
    echo ⚠️  IMPORTANT: Edit .env and add your LLM_API_KEY
    echo    Get your API key from:
    echo    - OpenAI: https://platform.openai.com/api-keys
    echo    - Anthropic: https://console.anthropic.com/
    echo.
    pause
)

REM Start the services
echo Starting services...
echo This may take a few minutes on first run...
echo.

docker-compose up --build

echo.
echo ✓ Application is running!
echo.
echo Access it at:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   Admin:    http://localhost:8000/admin (admin / admin)
echo.
pause
