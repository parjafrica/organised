#!/bin/bash

echo "🚀 Granada OS - Unified Development Setup"
echo "========================================"

# Install all dependencies
echo "📦 Installing Node.js dependencies..."
npm install

echo "🐍 Installing Python dependencies..."
python -m pip install -r requirements.txt

# Start services
echo "🌐 Starting all services..."
echo "   - Main App: http://localhost:5000"
echo "   - Admin Panel: http://localhost:5000/wabden"
echo ""

# Start main service (includes admin interface)
echo "🚀 Starting unified Granada OS application..."
DATABASE_URL="postgresql://user:password@localhost:5432/granada_os" NODE_ENV=development npx tsx server/core/index.ts