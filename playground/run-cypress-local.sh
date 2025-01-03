#!/bin/bash

SCRIPT_DIR="$(dirname "$0")"

wait_for_service() {
  SERVICE="$1"
  PORT="$2"
  echo "Waiting for $SERVICE at port $PORT..."
  i=0
  while ! nc -z localhost "$PORT"; do
    sleep 0.1s
    i=$((i + 1))
    if [[ "$i" -gt 300 ]]; then
      echo "Timed out after waiting 30s for $SERVICE at $PORT"
      exit 1
    fi
  done
}

cleanup() {
  git restore .
  if test -n "$PID_MKDOCS"; then
    echo "Stopping mkdocs at PID $PID_MKDOCS"
    pkill -P "$PID_MKDOCS"
  fi
  if test -n "$PID_DOCKER"; then
    echo "Stopping Docker at PID $PID_DOCKER"
    kill "$PID_DOCKER"
  fi
}

# Ensures frontend and backend are stopped when the script exits
trap cleanup EXIT

# Start frontend in the background
cp backend.local.json backend.json
npx webpack --mode=development
"$SCRIPT_DIR/../../serve-no-livereload.sh" &
PID_MKDOCS=$!

# Start backend in the background
docker run --rm -p 8080:8080 ghcr.io/epsilonlabs/playground-backend:standalone-server &
PID_DOCKER=$!

# Wait for both to finish starting
wait_for_service Frontend 8000
wait_for_service Backend 8080

# Run Cypress tests
npx cypress run --browser firefox --spec "cypress/e2e/*.cy.js" "$@"
