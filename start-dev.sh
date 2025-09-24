#!/bin/bash

# PaulClean Admin Frontend - Development Start Script
# This script ensures clean startup by killing old processes

echo "🧹 Cleaning up old Vite processes..."

# Kill all Vite processes (multiple methods)
pkill -f "node.*vite" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "paulclean-admin" 2>/dev/null || true

# Also kill any processes on port 8080
if lsof -i :8080 >/dev/null 2>&1; then
    echo "🔨 Killing processes on port 8080..."
    lsof -ti :8080 | xargs kill -9 2>/dev/null || true
fi

# Wait a moment for processes to terminate
sleep 3

# Check if port 8080 is free
if lsof -i :8080 >/dev/null 2>&1; then
    echo "⚠️  Port 8080 is still occupied. Killing processes on port 8080..."
    lsof -ti :8080 | xargs kill -9 2>/dev/null || true
    sleep 2
    # Double check
    if lsof -i :8080 >/dev/null 2>&1; then
        echo "🔨 Force killing remaining processes on port 8080..."
        lsof -ti :8080 | xargs sudo kill -9 2>/dev/null || true
        sleep 1
    fi
fi

echo "✅ Port 8080 is now free"
echo "🚀 Starting Vite development server on port 8080..."

# Use dev:simple to avoid recursion
npm run dev:simple
