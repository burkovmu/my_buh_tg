#!/bin/bash
# Скрипт сборки для Vercel

echo "Installing dependencies..."
npm install

echo "Building React app..."
npm run build

echo "Build completed successfully!"
ls -la dist/ 