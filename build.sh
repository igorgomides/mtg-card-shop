#!/bin/bash

# DECK CORE - Vercel Build Script
# This script is run automatically by Vercel during deployment

echo "🚀 Starting DECK CORE build process..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build the frontend
echo "🏗️ Building frontend..."
cd client && pnpm run build && cd ..

# Build the backend
echo "⚙️ Building backend..."
pnpm run build:server

echo "✅ Build completed successfully!"