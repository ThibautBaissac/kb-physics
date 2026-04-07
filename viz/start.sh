#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Parse KB data
echo "Parsing KB..."
npx tsx server/kb-parser.ts

# Start Express API server
echo "Starting API server on :3001..."
npx tsx watch server/index.ts &
echo $! > .server.pid

# Start Vite dev server
echo "Starting Vite on :5173..."
npx vite &
echo $! > .vite.pid

echo ""
echo "KB Physics Explorer running:"
echo "  Browser:  http://localhost:5173"
echo "  API:      http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop"

trap 'kill $(cat .server.pid 2>/dev/null) $(cat .vite.pid 2>/dev/null) 2>/dev/null; rm -f .server.pid .vite.pid; echo "Stopped."' EXIT INT TERM

wait
