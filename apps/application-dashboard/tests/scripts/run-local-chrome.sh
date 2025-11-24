#!/bin/bash

# Cleanup function
cleanup() {
    echo "Cleaning up..."
    if [ ! -z "$chrome_pid" ] && ps -p $chrome_pid > /dev/null 2>&1; then
        echo "Killing Chrome process (PID: $chrome_pid)"
        kill $chrome_pid 2>/dev/null || true
    fi
    lsof -ti:9222 | xargs kill -9 2>/dev/null || true
    rm -rf "$tmp_dir" 2>/dev/null || true
    rm -f version.json 2>/dev/null || true
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Load environment variables from .env if it exists
if [ -f ".env" ]; then
    echo "Loading environment variables from .env..."
    set -a  # automatically export all variables
    source .env
    set +a  # stop automatically exporting
else
    echo "⚠️  .env file not found! Tests will fail without environment variables."
    exit 1
fi

# Kill any existing Chrome instances using port 9222
echo "Cleaning up any existing Chrome instances..."
lsof -ti:9222 | xargs kill -9 2>/dev/null || true
sleep 1

# Kill any existing chrome-debug processes
pkill -f "chrome-debug" 2>/dev/null || true
sleep 1

# Clean up old Chrome profile and session data
echo "Cleaning up old Chrome profile and session data..."
rm -rf /tmp/chrome-debug
mkdir -p /tmp/chrome-debug

# Clear old CDP session data to force fresh connection
echo "Clearing old browser session data..."
rm -f tests/session_management/.cdp-session.json
rm -f tests/session-secrets/session-state.json

# Create temp directory for output
tmp_dir=$(mktemp -d)
chrome_output="$tmp_dir/chrome_output.tmp"

# Start Chrome directly with remote debugging
echo "Starting Chrome with remote debugging..."
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --remote-debugging-port=9222 \
    --window-size=1440,900 \
    --force-device-scale-factor=1 \
    --no-first-run \
    --no-default-browser-check \
    --disable-gpu \
    --disable-dev-shm-usage \
    --disable-software-rasterizer \
    --user-data-dir=/tmp/chrome-debug \
    --no-startup-window \
    "about:blank" > "$chrome_output" 2>&1 &
chrome_pid=$!

echo "Chrome PID: $chrome_pid"

# Wait for Chrome to initialize
sleep 5

# Check if Chrome process is running and port is open
echo "Checking if Chrome is ready..."
max_check=5
check_count=0
chrome_ready=false

while [ $check_count -lt $max_check ]; do
    if ps -p $chrome_pid > /dev/null 2>&1; then
        # Check if port is listening
        if lsof -ti:9222 > /dev/null 2>&1; then
            echo "✅ Chrome is running and port 9222 is open"
            chrome_ready=true
            break
        else
            echo "Chrome is running but port 9222 not ready yet... waiting"
        fi
    else
        echo "Chrome process died unexpectedly"
        break
    fi
    sleep 1
    check_count=$((check_count + 1))
done

if [ "$chrome_ready" = false ]; then
    echo "❌ Failed to start Chrome. Output:"
    cat "$chrome_output"
    rm -rf "$tmp_dir"
    exit 1
fi

# Wait for Chrome to be ready and get WebSocket URL
echo "Waiting for WebSocket URL..."
max_attempts=10
attempt=0
websocket_url=""

while [ $attempt -lt $max_attempts ]; do
    sleep 2
    echo "Attempting to connect to Chrome debugging port... ($((attempt + 1))/$max_attempts)"
    
    if curl -s http://localhost:9222/json/version > version.json; then
        websocket_url=$(cat version.json | grep -o 'ws://[^"]*')
        echo "Got WebSocket URL from Chrome at https://app-dev.zamp.ai/"
        if [ ! -z "$websocket_url" ]; then
            echo "Successfully got WebSocket URL: $websocket_url"
            break
        fi
    else
        echo "Failed to connect to Chrome debugging port"
    fi
    
    attempt=$((attempt + 1))
done

if [ -z "$websocket_url" ]; then
    echo "Failed to get WebSocket URL"
    exit 1
fi

# Run the tests with CDP URL in env
echo "Running Playwright tests..."
export SELENIUM_CDP_URL="$websocket_url"
export USE_LOCAL_SELENIUM=true

# Pass through all command line arguments to playwright
# If no arguments provided, default to all tests in tests/specs
npx playwright test tests/specs --config=playwright.config.ts --headed --reporter=line

# Cleanup will be handled by trap
echo "Tests completed. Cleanup will be handled automatically."
