#!/bin/bash

# Zamp Auto-Start Script
# Automates zamp setup, service startup, and browser URL generation
# Works for any user in any Coder workspace

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Global variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR=""
SERVICES_INPUT=""
ALL_SERVICES=false
HOT_RELOAD=false
URL_ONLY=false
SKIP_SETUP=false

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "${CYAN}🚀 $1${NC}"
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Automates zamp setup, service startup, and browser URL generation."
    echo ""
    echo "Options:"
    echo "  --services \"1,2h\"    Start specific services (e.g., 1=pantheon, 2h=frontend with hot reload)"
    echo "  --all                 Start all services"
    echo "  --hot                 Enable hot reload for all services (use with --all)"
    echo "  --url-only            Only output the browser URL (skip service startup)"
    echo "  --skip-setup          Skip the setup check (also skips env sync)"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Interactive mode - prompts for services"
    echo "  $0 --services \"1,2h\"         # Start pantheon + frontend with hot reload"
    echo "  $0 --all --hot               # Start all services with hot reload"
    echo "  $0 --url-only                # Just output the browser URL"
    echo ""
    echo "Available Services:"
    echo "  1. pantheon"
    echo "  2. application-platform-frontend"
    echo "  3. application-platform"
    echo "  4. data_platform"
    echo ""
    echo "Service Selection Syntax:"
    echo "  - Numbers: 1,3,4 (normal mode)"
    echo "  - Numbers with hot reload: 1h,2h,3h"
    echo "  - Names: pantheon,data_platform"
    echo "  - Names with hot reload: pantheon+h,application-platform-frontend+h"
    echo "  - Mixed: 1h,3,4h"
}

# Detect project structure
detect_project_structure() {
    local search_dir="$SCRIPT_DIR"
    
    # Search up the directory tree for zamp project indicators
    while [ "$search_dir" != "/" ]; do
        if [ -d "$search_dir/zamp_dev_setup" ]; then
            ROOT_DIR="$search_dir"
            return 0
        fi
        
        # Check parent directory
        local parent_dir="$(dirname "$search_dir")"
        if [ -d "$parent_dir/zamp_dev_setup" ]; then
            ROOT_DIR="$parent_dir"
            return 0
        fi
        
        search_dir="$parent_dir"
    done
    
    log_error "Could not detect Zamp project structure"
    return 1
}

# Run zamp setup (syncs env variables like NEXT_PUBLIC_BASE_API_URL)
# If setup was already completed, reset and run again to ensure env is fresh
run_setup() {
    log_header "Running zamp setup..."
    cd "$ROOT_DIR"
    
    # Check if setup says it's already completed
    local setup_output=$(zamp setup 2>&1)
    echo "$setup_output"
    
    if echo "$setup_output" | grep -q "Setup already completed"; then
        log_info "Setup already completed, resetting and running again to ensure fresh env..."
        zamp reset-setup
        zamp setup
    fi
    
    log_success "Zamp setup completed"
}

# Check service status
check_services_running() {
    log_info "Checking service status..."
    cd "$ROOT_DIR"
    zamp dev-status 2>/dev/null || true
}

# Start services with the given input
start_services() {
    local services_input="$1"
    
    log_header "Starting services: $services_input"
    cd "$ROOT_DIR"
    
    # Use echo to pipe the service selection to zamp dev (interactive mode)
    echo "$services_input" | zamp dev
    
    log_success "Services started"
}

# Start all services
start_all_services() {
    log_header "Starting all services..."
    cd "$ROOT_DIR"
    
    if [ "$HOT_RELOAD" = true ]; then
        zamp dev-hot
    else
        zamp dev-all
    fi
    
    log_success "All services started"
}

# Get the Coder browser URL
get_browser_url() {
    local port="${1:-2000}"
    local url_template="${VSCODE_PROXY_URI:-}"
    
    # If VSCODE_PROXY_URI is set, use it
    if [ -n "$url_template" ]; then
        local browser_url="${url_template//\{\{port\}\}/$port}"
        echo "$browser_url"
        return
    fi
    
    # Fallback: construct URL from individual Coder environment variables
    local agent="${CODER_WORKSPACE_AGENT_NAME:-}"
    local workspace="${CODER_WORKSPACE_NAME:-}"
    local owner="${CODER_WORKSPACE_OWNER_NAME:-}"
    
    if [ -n "$agent" ] && [ -n "$workspace" ] && [ -n "$owner" ]; then
        echo "https://${port}--${agent}--${workspace}--${owner}.coder-live.zamp.dev"
        return
    fi
    
    # Not in Coder environment
    log_warning "Not running in Coder environment - using localhost"
    echo "http://localhost:$port"
}

# Display environment info
show_environment_info() {
    echo ""
    log_header "Coder Environment Information"
    echo ""
    
    if [ -n "${CODER_WORKSPACE_NAME:-}" ]; then
        echo "  Workspace:  ${CODER_WORKSPACE_NAME}"
    fi
    
    if [ -n "${CODER_WORKSPACE_OWNER_NAME:-}" ]; then
        echo "  Owner:      ${CODER_WORKSPACE_OWNER_NAME}"
    fi
    
    if [ -n "${CODER_WORKSPACE_AGENT_NAME:-}" ]; then
        echo "  Agent:      ${CODER_WORKSPACE_AGENT_NAME}"
    fi
    
    echo ""
}

# Interactive service selection
interactive_service_selection() {
    echo ""
    log_header "Interactive Service Selection"
    echo ""
    echo "Available services:"
    echo "  1. pantheon"
    echo "  2. application-platform-frontend"
    echo "  3. application-platform"
    echo "  4. data_platform"
    echo ""
    echo "Select services to start (with hot reload options):"
    echo "  • Service numbers: 1,3,4 (normal mode)"
    echo "  • Service numbers with hot reload: 1h,2h,3h"
    echo "  • Mixed: 1h,3,4h (some with hot reload, some normal)"
    echo "  • All services: all (normal mode) or all+h (hot reload mode)"
    echo "  • Press Enter to skip"
    echo ""
    
    read -p "Services to start: " SERVICES_INPUT
    
    if [ -z "$SERVICES_INPUT" ]; then
        log_info "No services selected"
        return 1
    fi
    
    return 0
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --services)
                SERVICES_INPUT="$2"
                shift 2
                ;;
            --all)
                ALL_SERVICES=true
                shift
                ;;
            --hot)
                HOT_RELOAD=true
                shift
                ;;
            --url-only)
                URL_ONLY=true
                shift
                ;;
            --skip-setup)
                SKIP_SETUP=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Main function
main() {
    parse_args "$@"
    
    log_header "Zamp Auto-Start"
    echo ""
    
    # Detect project structure
    if ! detect_project_structure; then
        exit 1
    fi
    
    log_info "Project root: $ROOT_DIR"
    
    # Show environment info
    show_environment_info
    
    # Get and display browser URL
    local browser_url=$(get_browser_url 2000)
    echo ""
    log_header "Browser URL"
    echo ""
    echo "  Frontend (port 2000): $browser_url"
    echo ""
    
    # If URL only mode, exit here
    if [ "$URL_ONLY" = true ]; then
        exit 0
    fi
    
    # Run zamp setup to ensure env is correctly configured (includes NEXT_PUBLIC_BASE_API_URL)
    if [ "$SKIP_SETUP" = false ]; then
        run_setup
    fi
    
    # Start services
    if [ "$ALL_SERVICES" = true ]; then
        start_all_services
    elif [ -n "$SERVICES_INPUT" ]; then
        start_services "$SERVICES_INPUT"
    else
        # Interactive mode
        if interactive_service_selection; then
            if [ "$SERVICES_INPUT" = "all" ]; then
                ALL_SERVICES=true
                start_all_services
            elif [ "$SERVICES_INPUT" = "all+h" ]; then
                ALL_SERVICES=true
                HOT_RELOAD=true
                start_all_services
            else
                start_services "$SERVICES_INPUT"
            fi
        fi
    fi
    
    # Final output
    echo ""
    log_success "Zamp Auto-Start Complete!"
    echo ""
    echo "  Open in browser: $browser_url"
    echo ""
}

# Run main function
main "$@"
