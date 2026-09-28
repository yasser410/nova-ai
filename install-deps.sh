#!/bin/bash

echo "📋 Nova AI Platform - Development Setup"
echo "========================================="
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install package dependencies
echo "Installing package dependencies..."
cd packages/types && npm install && cd ../..
cd packages/core && npm install && cd ../..
cd packages/backend && npm install && cd ../..
cd packages/frontend && npm install && cd ../..

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "Commands:"
echo "  npm run dev     - Start all services in development mode"
echo "  npm run build   - Build all packages"
echo "  npm run test    - Run tests"
echo ""
