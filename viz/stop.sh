#!/usr/bin/env bash

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

stopped=0

if [ -f .server.pid ]; then
  kill "$(cat .server.pid)" 2>/dev/null && echo "API server stopped." && stopped=1
  rm -f .server.pid
fi

if [ -f .vite.pid ]; then
  kill "$(cat .vite.pid)" 2>/dev/null && echo "Vite server stopped." && stopped=1
  rm -f .vite.pid
fi

# Fallback: kill by port
if lsof -ti:3001 >/dev/null 2>&1; then
  kill $(lsof -ti:3001) 2>/dev/null && echo "Killed process on :3001." && stopped=1
fi

if lsof -ti:5173 >/dev/null 2>&1; then
  kill $(lsof -ti:5173) 2>/dev/null && echo "Killed process on :5173." && stopped=1
fi

if [ $stopped -eq 0 ]; then
  echo "No servers running."
else
  echo "All stopped."
fi
