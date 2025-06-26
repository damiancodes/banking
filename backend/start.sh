#!/bin/bash

echo "Starting Treasury Movement Simulator Backend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start the server
if [ "$NODE_ENV" = "production" ]; then
    echo "Starting in production mode..."
    npm start
else
    echo "Starting in development mode..."
    npm run dev
fi
