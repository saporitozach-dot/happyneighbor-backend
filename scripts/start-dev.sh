#!/bin/bash

echo "🚀 Setting up and running Happy Neighbor React app..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/ first."
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo "📦 Installing dependencies (this may take a minute)..."
npm install

echo "🌐 Starting development server..."
npm run dev

