#!/bin/bash

# Configuration variables
PORT=8001  # Hardcoded port
API_SERVICE=pantheon-api

# Get CODER_WORKSPACE_NAME from environment
if [ -z "$CODER_WORKSPACE_NAME" ]; then
    echo "❌ CODER_WORKSPACE_NAME environment variable is not set"
    exit 1
fi

# Construct the API URL
NEXT_PUBLIC_BASE_API_URL="https://${API_SERVICE}--main--${CODER_WORKSPACE_NAME}--${WORKSPACE_USER}.coder-live.zamp.dev"
NEXT_SERVER_API_URL="http://localhost:${PORT}"
NEXT_PUBLIC_ENVIRONMENT="development"

update_env_file() {
    local env_file=$1
    local env_dir=$(dirname "$env_file")
    
    echo "🔧 Updating environment file: $env_file"
    
    # Create directory if it doesn't exist
    mkdir -p "$env_dir"
    
    # Create or update the .env.local file
    if [ -f "$env_file" ]; then
        # Update existing file
        if grep -q "^NEXT_PUBLIC_BASE_API_URL=" "$env_file"; then
            sed -i "s|^NEXT_PUBLIC_BASE_API_URL=.*|NEXT_PUBLIC_BASE_API_URL=$NEXT_PUBLIC_BASE_API_URL|" "$env_file"
            echo "🔄 Updated existing NEXT_PUBLIC_BASE_API_URL in $env_file"
        else
            echo "NEXT_PUBLIC_BASE_API_URL=$NEXT_PUBLIC_BASE_API_URL" >> "$env_file"
            echo "➕ Added NEXT_PUBLIC_BASE_API_URL to $env_file"
        fi

        if grep -q "^NEXT_SERVER_API_URL=" "$env_file"; then
            sed -i "s|^NEXT_SERVER_API_URL=.*|NEXT_SERVER_API_URL=$NEXT_SERVER_API_URL|" "$env_file"
            echo "🔄 Updated existing NEXT_SERVER_API_URL in $env_file"
        else
            echo "NEXT_SERVER_API_URL=$NEXT_SERVER_API_URL" >> "$env_file"
            echo "➕ Added NEXT_SERVER_API_URL to $env_file"
        fi

        if grep -q "^NEXT_PUBLIC_ENVIRONMENT=" "$env_file"; then
            sed -i "s|^NEXT_PUBLIC_ENVIRONMENT=.*|NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT|" "$env_file"
            echo "🔄 Updated existing NEXT_PUBLIC_ENVIRONMENT in $env_file"
        else
            echo "NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT" >> "$env_file"
            echo "➕ Added NEXT_PUBLIC_ENVIRONMENT to $env_file"
        fi
    else
        # Create new file
        echo "NEXT_PUBLIC_BASE_API_URL=$NEXT_PUBLIC_BASE_API_URL" > "$env_file"
        echo "NEXT_SERVER_API_URL=$NEXT_SERVER_API_URL" >> "$env_file"
        echo "NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT" >> "$env_file"
        echo "📝 Created new $env_file"
    fi
    
    # Set appropriate permissions
    chmod 600 "$env_file"
    echo "✅ Environment file updated: $env_file"
}

main() {
    echo "🚀 Starting Application Platform Frontend secrets sync..."
    
    # Display configuration
    echo "📋 Configuration:"
    echo "  • PORT: $PORT"
    echo "  • CODER_WORKSPACE_NAME: $CODER_WORKSPACE_NAME"
    echo "  • NEXT_PUBLIC_BASE_API_URL: $NEXT_PUBLIC_BASE_API_URL"
    echo "  • NEXT_SERVER_API_URL: $NEXT_SERVER_API_URL"
    echo ""
    
    # Get current directory (should be application-platform-frontend service directory)
    local service_dir=$(pwd)
    
    # Verify we're in the application-platform-frontend directory
    if [ ! -f "package.json" ] || [ ! -f "Makefile" ]; then
        echo "❌ This script must be run from the application-platform-frontend service directory"
        exit 1
    fi
    
    # Update .env.local in root directory
    echo "⏳ Updating root .env.local..."
    update_env_file "${service_dir}/.env.local"
    
    # Update .env.local in application-dashboard directory
    echo "⏳ Updating application-dashboard .env.local..."
    update_env_file "${service_dir}/apps/application-dashboard/.env.local"
    
    echo ""
    echo "✅ Application Platform Frontend secrets sync complete!"
    echo "📁 Updated files:"
    echo "  • ${service_dir}/.env.local"
    echo "  • ${service_dir}/apps/application-dashboard/.env.local"
}

# Run the main function
main "$@" 