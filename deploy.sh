#!/bin/bash
set -e

echo "=== PingRelay Deploy ==="

cd "$(dirname "$0")"

echo "[1/4] Pulling latest changes..."
git pull

echo "[2/4] Installing dependencies..."
cd web
yarn install --frozen-lockfile
cd ..

echo "[3/4] Building..."
cd web
yarn build
cd ..

echo "[4/4] Restarting PM2..."
pm2 startOrRestart ecosystem.config.js --update-env

echo "=== Deploy complete ==="
pm2 status
