#!/bin/bash

set -e

echo "🧹 Cleaning up Nova AI Platform"
echo "================================="
echo ""

echo "Stopping Docker containers..."
docker-compose down

echo "Removing volumes..."
docker volume rm nova-postgres nova-ollama 2>/dev/null || true

echo "✅ Cleanup complete!"
