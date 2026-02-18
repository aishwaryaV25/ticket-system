#!/bin/bash

# Support Ticket System - Quick Start Helper

echo "🚀 Support Ticket System - Docker Setup"
echo "========================================"
echo ""

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✓ Docker and Docker Compose are installed"
echo ""

# Check .env file
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your LLM_API_KEY"
    echo "   Get your API key from:"
    echo "   - OpenAI: https://platform.openai.com/api-keys"
    echo "   - Anthropic: https://console.anthropic.com/"
    echo ""
fi

# Start the services
echo "Starting services..."
echo "This may take a few minutes on first run..."
echo ""

docker-compose up --build

echo ""
echo "✓ Application is running!"
echo ""
echo "Access it at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  Admin:    http://localhost:8000/admin (admin / admin)"
