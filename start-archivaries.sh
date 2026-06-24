#!/usr/bin/env bash

set -e

export PATH="$HOME/.bun/bin:$PATH"

PROJECT_DIR="$(pwd -P)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

cd "$PROJECT_DIR"

echo "🚀 Starting ArchivAries..."

cleanup() {
    echo
    echo "🛑 Stopping backend and frontend..."

    if [[ -n "${BACKEND_PID:-}" ]]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi

    if [[ -n "${FRONTEND_PID:-}" ]]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi

    wait 2>/dev/null || true
}

trap cleanup INT TERM EXIT

echo "📦 Starting backend..."
cd "$BACKEND_DIR"
bun run start:dev &
BACKEND_PID=$!

echo "🎨 Starting frontend..."
cd "$FRONTEND_DIR"
bun run dev &
FRONTEND_PID=$!

echo
echo "✅ ArchivAries is running."
echo "Backend PID:  $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo
echo "Press Ctrl+C to stop both."

wait
