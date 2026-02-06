#!/bin/bash
set -e

echo "=== PingRelay Deploy ==="

cd "$(dirname "$0")"

echo "[1/4] Pulling latest changes..."
git pull

echo "[2/4] Installing dependencies..."
cd web
yarn install --frozen-lockfile

echo "[3/4] Building..."
yarn build

echo "[4/4] Restarting PM2..."
pm2 startOrRestart ecosystem.config.js --update-env

echo "=== Deploy complete ==="
pm2 status
