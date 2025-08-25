#!/bin/bash

# Kill any existing Chrome instances using port 9222
echo "Cleaning up any existing Chrome instances..."
lsof -ti:9222 | xargs kill -9 2>/dev/null

# Clean up old Chrome profile
echo "Cleaning up old Chrome profile..."
rm -rf /tmp/chrome-debug

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
    --user-data-dir=/tmp/chrome-debug \
    --no-startup-window \
    "about:blank" > "$chrome_output" 2>&1 &
chrome_pid=$!

# Wait a bit for Chrome to start
sleep 3

# Check if Chrome process is running
if ! ps -p $chrome_pid > /dev/null; then
    echo "Failed to start Chrome. Output:"
    cat "$chrome_output"
    rm -rf "$tmp_dir"  # Clean up temp directory
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

rm version.json

if [ -z "$websocket_url" ]; then
    echo "Failed to get WebSocket URL"
    exit 1
fi

# Run the tests with CDP URL in env
echo "Running Playwright tests..."
export SELENIUM_CDP_URL="$websocket_url"
export USE_LOCAL_SELENIUM=true
npx playwright test tests/specs --config=playwright.config.ts --headed --reporter=line

# Clean up temporary files
rm -rf "$tmp_dir"

# Chrome will be cleaned up by global teardown
echo "Tests completed. Chrome will be cleaned up automatically."
