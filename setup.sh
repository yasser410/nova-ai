#!/bin/bash

set -e

echo "🚀 Nova AI Platform - Setup Script"
echo "====================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker found"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# AI Providers (optional - get keys from their websites)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GEMINI_KEY=
EOF
    echo "✅ .env file created. Add your API keys if you have them."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🐳 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "✅ Setup complete!"
echo ""
echo "Services running:"
echo "  🌐 Frontend:  http://localhost:3000"
echo "  🔌 Backend:   http://localhost:3001"
echo "  🐘 Database:  localhost:5432"
echo "  📦 Redis:     localhost:6379"
echo "  🤖 Ollama:    http://localhost:11434"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      docker-compose down"
echo ""
