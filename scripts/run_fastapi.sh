#!/bin/bash

echo "Granada OS - FastAPI Backend Services"
echo "====================================="

# Kill any existing FastAPI processes
pkill -f "uvicorn.*server.core.master_orchestrator:app" 2>/dev/null
pkill -f "uvicorn.*server.bots.bot_service:app" 2>/dev/null

# Wait a moment
sleep 2

# Start FastAPI services
echo "Starting FastAPI Main Service on port 8000..."
python3 -m uvicorn server.core.master_orchestrator:app --host 0.0.0.0 --port 8000 --reload &
MAIN_PID=$!

echo "Starting FastAPI Bot Service on port 8001..."
python3 -m uvicorn server.bots.bot_service:app --host 0.0.0.0 --port 8001 --reload &
BOT_PID=$!

# Wait for services to start
sleep 5

# Test services
echo ""
echo "Testing services..."

if curl -s http://localhost:8000/health >/dev/null 2>&1; then
    echo "✓ Main API Service (port 8000) - Running"
else
    echo "✗ Main API Service (port 8000) - Failed"
fi

if curl -s http://localhost:8001/ >/dev/null 2>&1; then
    echo "✓ Bot Service (port 8001) - Running"
else
    echo "✗ Bot Service (port 8001) - Failed"
fi

echo ""
echo "FastAPI Architecture:"
echo "- Main API: http://localhost:8000 (docs: /docs)"
echo "- Bot Service: http://localhost:8001 (docs: /docs)"
echo "- Frontend: http://localhost:5000 (Express/React)"
echo ""
echo "Services running with PIDs: Main=$MAIN_PID, Bot=$BOT_PID"
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "Stopping services..."; kill $MAIN_PID $BOT_PID 2>/dev/null; exit 0' INT
wait