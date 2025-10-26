# Get the current directory and root directory
CURRENT_DIR := $(shell pwd)
ROOT_DIR := $(shell git rev-parse --show-toplevel 2>/dev/null || echo $(CURRENT_DIR))

# Set up automatic cleanup on interrupt
.PHONY: clean-tail
clean-tail: ## Clean up stray tail processes
	@echo -e "\033[34mCleaning up stray tail processes...\033[0m"
	@pkill -f "tail -f.*frontend.log" 2>/dev/null || true
	@pkill -f "tail -f.*\.log" 2>/dev/null || true
	@echo -e "\033[32m✅ Stray tail processes cleaned up\033[0m"

# Process management
PID_DIR := $(CURRENT_DIR)/.pids
LOG_DIR := $(CURRENT_DIR)/.logs
HOT_RELOAD ?= false

# Service configurations
FRONTEND_PORT ?= 2000
FRONTEND_BUILD_PORT ?= 3000

# Node executable
NODE := npm

# Create necessary directories
$(shell mkdir -p $(PID_DIR) $(LOG_DIR))

.PHONY: help install install-dev install-prod sync-secrets sync-from-main dev dev-hot dev-stop dev-clean dev-restart dev-status dev-logs dev-tail dev-tail-stop health debug check-port check-ports check-all-ports kill-all-node check-stray clean-tail force-kill-port

help: ## Show this help message
	@echo "Application Platform Frontend Development Orchestration"
	@echo "====================================================="
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Environment variables:"
	@echo "  HOT_RELOAD          Enable hot reload (default: false)"
	@echo "  FRONTEND_PORT       Port for hot reload service (default: 2000)"
	@echo "  FRONTEND_BUILD_PORT Port for build service (default: 3000)"
	@echo ""
	@echo "Port Forwarding (Coder):"
	@echo "  • Services now bind to 0.0.0.0 for Coder compatibility"
	@echo "  • Use 'make check-ports' to verify port forwarding status"
	@echo "  • Check Coder's 'Ports' tab for auto-detected services"
	@echo ""
	@echo "Automatic Cleanup:"
	@echo "  • Ctrl+C automatically kills stray tail processes"
	@echo "  • No more unwanted terminal output from background processes"
	@echo "  • Use 'make dev-tail-stop' to manually stop tailing"
	@echo "  • Use 'make check-stray' to diagnose any remaining issues"
	@echo ""
	@echo "Dependency Management:"
	@echo "  • Use 'make install' to install all dependencies"
	@echo "  • Use 'make install-dev' to install development dependencies"
	@echo "  • Use 'make install-prod' to install production dependencies only"

# =============================================================================
# DEPENDENCY MANAGEMENT
# =============================================================================

install: ## Install all dependencies (including dev dependencies)
	@echo -e "\033[34m4. 🔐 Syncing secrets...\033[0m"
	@$(MAKE) sync-secrets
	@echo -e "\033[34mInstalling all dependencies...\033[0m"
	@$(NODE) install
	@echo -e "\033[32m✅ All dependencies installed\033[0m"

install-dev: ## Install development dependencies
	@echo -e "\033[34m4. 🔐 Syncing secrets...\033[0m"
	@$(MAKE) sync-secrets
	@echo -e "\033[34mInstalling development dependencies...\033[0m"
	@$(NODE) install
	@echo -e "\033[32m✅ Development dependencies installed\033[0m"

install-prod: ## Install production dependencies only
	@echo -e "\033[34m4. 🔐 Syncing secrets...\033[0m"
	@$(MAKE) sync-secrets
	@echo -e "\033[34mInstalling production dependencies only...\033[0m"
	@$(NODE) ci --only=production
	@echo -e "\033[32m✅ Production dependencies installed\033[0m"

# =============================================================================
# SECRETS MANAGEMENT
# =============================================================================

sync-secrets: ## Sync secrets and update environment files
	@echo -e "\033[34mSyncing secrets for Application Platform Frontend...\033[0m"
	@./sync-secrets.sh
	@echo -e "\033[32m✅ Secrets sync complete\033[0m"

sync-from-main: ## Sync service to main branch and update secrets/dependencies
	@echo -e "\033[34m🔄 Syncing Application Platform Frontend to main branch...\033[0m"
	@echo -e "\033[36m📂 Working directory: $(CURRENT_DIR)\033[0m"
	@echo ""
	@echo -e "\033[34m1. 💾 Stashing local changes...\033[0m"
	@if git diff --quiet && git diff --cached --quiet; then \
		echo -e "\033[32m✅ No local changes to stash\033[0m"; \
	else \
		echo -e "\033[33m📦 Stashing local changes...\033[0m"; \
		git stash push -m "Auto-stash before sync to main - $(shell date)"; \
	fi
	@echo ""
	@echo -e "\033[34m2. 🌟 Switching to main branch...\033[0m"
	@git checkout main
	@echo ""
	@echo -e "\033[34m3. ⬇️  Pulling latest changes...\033[0m"
	@git pull origin main
	@echo ""
	@echo -e "\033[34m4. 🔐 Syncing secrets...\033[0m"
	@$(MAKE) sync-secrets
	@echo ""
	@echo -e "\033[34m5. 📦 Updating Node.js dependencies...\033[0m"
	@if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then \
		echo -e "\033[33m⚠️  Dependencies need installation...\033[0m"; \
		$(MAKE) install; \
	else \
		echo -e "\033[34m🔄 Updating dependencies...\033[0m"; \
		$(NODE) install; \
	fi
	@echo ""
	@echo -e "\033[32m✅ Application Platform Frontend sync to main complete!\033[0m"

# =============================================================================
# MAIN DEVELOPMENT COMMANDS
# =============================================================================

dev: ## Start all frontend services
	@echo -e "\033[34mStarting frontend development environment...\033[0m"
	@echo -e "\033[36mHOT_RELOAD=$(HOT_RELOAD)\033[0m"
	@echo -e "\033[36mFRONTEND_PORT=$(FRONTEND_PORT)\033[0m"
	@echo ""
	@echo -e "\033[34mChecking dependencies...\033[0m"
	@if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then \
		echo -e "\033[33m⚠️  Dependencies not installed. Installing now...\033[0m"; \
		$(MAKE) install; \
	else \
		echo -e "\033[32m✅ Dependencies are installed\033[0m"; \
	fi
	@echo ""
	$(MAKE) dev-stop 2>/dev/null || true
	$(MAKE) check-port
	$(MAKE) start-frontend
	@echo ""
	@echo -e "\033[32m✅ Frontend development environment started!\033[0m"
	@echo -e "\033[36m📊 Service status: $(MAKE) dev-status\033[0m"
	@echo -e "\033[36m📋 View logs: $(MAKE) dev-logs\033[0m"
	@echo -e "\033[36m🔄 Restart services: $(MAKE) dev-restart\033[0m"
	@echo -e "\033[36m🛑 Stop services: $(MAKE) dev-stop\033[0m"

dev-hot: ## Start all services with hot reload enabled
	@HOT_RELOAD=true $(MAKE) dev

dev-parallel: ## Start services for parallel orchestration (skips cleanup)
	@echo -e "\033[34mStarting Frontend (parallel mode)...\033[0m"
	@echo -e "\033[36mHOT_RELOAD=$(HOT_RELOAD)\033[0m"
	@echo -e "\033[36mFRONTEND_PORT=$(FRONTEND_PORT)\033[0m"
	@echo ""
	@echo -e "\033[34mChecking dependencies...\033[0m"
	@if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then \
		echo -e "\033[33m⚠️  Dependencies not installed. Installing now...\033[0m"; \
		$(MAKE) install; \
	else \
		echo -e "\033[32m✅ Dependencies are installed\033[0m"; \
	fi
	@echo ""
	$(MAKE) start-frontend
	@echo ""
	@echo -e "\033[32m✅ Frontend services started!\033[0m"

dev-stop: ## Stop all frontend services
	@echo -e "\033[34mStopping frontend development environment...\033[0m"
	@for pid_file in $(PID_DIR)/*.pid; do \
		if [ -f "$$pid_file" ]; then \
			pid=$$(cat "$$pid_file"); \
			service=$$(basename "$$pid_file" .pid); \
			echo -e "\033[33mStopping $$service (PID: $$pid)...\033[0m"; \
			kill -TERM $$pid 2>/dev/null || true; \
			rm -f "$$pid_file"; \
		fi; \
	done
	@echo -e "\033[33mKilling all Node.js and npm processes...\033[0m"
	@pkill -f "npm.*dev-coder" 2>/dev/null || true
	@pkill -f "npm.*start-coder" 2>/dev/null || true
	@pkill -f "next.*dev" 2>/dev/null || true
	@pkill -f "next.*start" 2>/dev/null || true
	@pkill -f "node.*next" 2>/dev/null || true
	@pkill -f "next" 2>/dev/null || true
	@pkill -f "turbo" 2>/dev/null || true
	@pkill -f "turbo.*daemon" 2>/dev/null || true
	@pkill -f "turbo.*dev" 2>/dev/null || true
	@pkill -f "turbo.*start" 2>/dev/null || true
	@echo -e "\033[33mKilling any remaining Node.js processes...\033[0m"
	@ps aux | grep -E "(next|npm|node|turbo)" | grep -v grep | awk '{print $$2}' | xargs -r kill -TERM 2>/dev/null || true
	@echo -e "\033[33mWaiting for processes to terminate...\033[0m"
	@sleep 3
	@echo -e "\033[33mForcefully killing any remaining processes on ports $(FRONTEND_PORT) and $(FRONTEND_BUILD_PORT)...\033[0m"
	@for port in $(FRONTEND_PORT) $(FRONTEND_BUILD_PORT); do \
		if command -v lsof >/dev/null 2>&1; then \
			lsof -ti:$$port | xargs -r kill -9 2>/dev/null || true; \
		elif command -v ss >/dev/null 2>&1; then \
			ss -tlnp | grep ":$$port " | sed 's/.*pid=\([0-9]*\).*/\1/' | xargs -r kill -9 2>/dev/null || true; \
		elif command -v netstat >/dev/null 2>&1; then \
			netstat -tlnp | grep ":$$port " | awk '{print $$7}' | sed 's/\/.*//' | xargs -r kill -9 2>/dev/null || true; \
		fi; \
	done
	@echo -e "\033[33mFinal cleanup - killing any remaining Node.js processes...\033[0m"
	@ps aux | grep -E "(next|npm|node|turbo)" | grep -v grep | awk '{print $$2}' | xargs -r kill -9 2>/dev/null || true
	@echo -e "\033[32m✅ All services stopped\033[0m"

dev-clean: ## Stop all services and clean up PID/log files
	$(MAKE) dev-stop
	@echo "Cleaning up PID and log files..."
	@rm -rf $(PID_DIR) $(LOG_DIR)
	@echo "✅ Cleanup complete"

dev-restart: ## Restart all services
	@echo "Restarting frontend development environment..."
	$(MAKE) dev-stop
	$(MAKE) dev

# =============================================================================
# MONITORING & DEBUGGING COMMANDS
# =============================================================================

check-port: ## Check if port is available and kill conflicting processes
	@echo "Checking ports $(FRONTEND_PORT) (hot reload) and $(FRONTEND_BUILD_PORT) (build)..."
	@for port in $(FRONTEND_PORT) $(FRONTEND_BUILD_PORT); do \
		echo "Checking port $$port..."; \
		if command -v ss >/dev/null 2>&1; then \
			if ss -tlnp | grep -q ":$$port "; then \
				echo "⚠️  Port $$port is in use. Attempting to kill conflicting processes..."; \
				ss -tlnp | grep ":$$port " | sed 's/.*pid=\([0-9]*\).*/\1/' | xargs -r kill -TERM 2>/dev/null || true; \
			sleep 3; \
		fi; \
	elif command -v netstat >/dev/null 2>&1; then \
			if netstat -tlnp | grep -q ":$$port "; then \
				echo "⚠️  Port $$port is in use. Attempting to kill conflicting processes..."; \
				netstat -tlnp | grep ":$$port " | awk '{print $$7}' | sed 's/\/.*//' | xargs -r kill -TERM 2>/dev/null || true; \
				sleep 3; \
			fi; \
		elif command -v lsof >/dev/null 2>&1; then \
			if lsof -i:$$port >/dev/null 2>&1; then \
				echo "⚠️  Port $$port is in use. Attempting to kill conflicting processes..."; \
				lsof -ti:$$port | xargs -r kill -TERM 2>/dev/null || true; \
			sleep 3; \
		fi; \
	else \
			echo "⚠️  Cannot check port availability. Please ensure port $$port is free."; \
		fi; \
	done

check-all-ports: ## Check and kill processes on common development ports
	@echo -e "\033[34mChecking common development ports...\033[0m"
	@for port in 2000 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010; do \
		echo -e "\033[36mChecking port $$port...\033[0m"; \
		if command -v ss >/dev/null 2>&1; then \
			if ss -tlnp | grep -q ":$$port "; then \
				echo -e "\033[33m⚠️  Port $$port is in use. Killing processes...\033[0m"; \
				ss -tlnp | grep ":$$port " | sed 's/.*pid=\([0-9]*\).*/\1/' | xargs -r kill -TERM 2>/dev/null || true; \
			fi; \
		elif command -v netstat >/dev/null 2>&1; then \
			if netstat -tlnp | grep -q ":$$port "; then \
				echo -e "\033[33m⚠️  Port $$port is in use. Killing processes...\033[0m"; \
				netstat -tlnp | grep ":$$port " | awk '{print $$7}' | sed 's/\/.*//' | xargs -r kill -TERM 2>/dev/null || true; \
			fi; \
		elif command -v lsof >/dev/null 2>&1; then \
			if lsof -i:$$port >/dev/null 2>&1; then \
				echo -e "\033[33m⚠️  Port $$port is in use. Killing processes...\033[0m"; \
				lsof -ti:$$port | xargs -r kill -TERM 2>/dev/null || true; \
			fi; \
		fi; \
	done
	@echo -e "\033[32m✅ Port cleanup complete\033[0m"

kill-all-node: ## Aggressively kill all Node.js related processes
	@echo -e "\033[34mAggressively killing all Node.js related processes...\033[0m"
	@echo -e "\033[33mKilling turbo daemon and processes...\033[0m"
	@pkill -f "turbo.*daemon" 2>/dev/null || true
	@pkill -f "turbo" 2>/dev/null || true
	@echo -e "\033[33mKilling Next.js processes...\033[0m"
	@pkill -f "next" 2>/dev/null || true
	@pkill -f "npm.*dev-coder" 2>/dev/null || true
	@pkill -f "npm.*start-coder" 2>/dev/null || true
	@echo -e "\033[33mKilling any remaining Node.js processes...\033[0m"
	@ps aux | grep -E "(next|npm|node|turbo)" | grep -v grep | awk '{print $$2}' | xargs -r kill -TERM 2>/dev/null || true
	@sleep 2
	@echo -e "\033[33mForce killing any remaining processes...\033[0m"
	@ps aux | grep -E "(next|npm|node|turbo)" | grep -v grep | awk '{print $$2}' | xargs -r kill -9 2>/dev/null || true
	@echo -e "\033[32m✅ All Node.js processes killed\033[0m"

check-ports: ## Check port forwarding status for Coder
	@echo -e "\033[34mPort Forwarding Status for Coder\033[0m"
	@echo -e "\033[34m================================\033[0m"
	@echo ""
	@for port in $(FRONTEND_PORT) $(FRONTEND_BUILD_PORT); do \
		echo -e "\033[36mChecking port $$port...\033[0m"; \
		echo -e "\033[36mPort usage status:\033[0m"; \
		if command -v ss >/dev/null 2>&1; then \
			if ss -tlnp | grep -q ":$$port "; then \
				echo -e "\033[33m⚠️  Port $$port is in use by:\033[0m"; \
				ss -tlnp | grep ":$$port " | while read line; do \
					echo -e "\033[33m   $$line\033[0m"; \
				done; \
			else \
				echo -e "\033[32m✅ Port $$port is free\033[0m"; \
			fi; \
		elif command -v netstat >/dev/null 2>&1; then \
			if netstat -tlnp | grep -q ":$$port "; then \
				echo -e "\033[33m⚠️  Port $$port is in use by:\033[0m"; \
				netstat -tlnp | grep ":$$port " | while read line; do \
					echo -e "\033[33m   $$line\033[0m"; \
				done; \
			else \
				echo -e "\033[32m✅ Port $$port is free\033[0m"; \
			fi; \
		elif command -v lsof >/dev/null 2>&1; then \
			if lsof -i:$$port >/dev/null 2>&1; then \
				echo -e "\033[33m⚠️  Port $$port is in use by:\033[0m"; \
				lsof -i:$$port | while read line; do \
					echo -e "\033[33m   $$line\033[0m"; \
				done; \
			else \
				echo -e "\033[32m✅ Port $$port is free\033[0m"; \
			fi; \
		else \
			echo -e "\033[33m⚠️  Cannot check port usage (no ss/netstat/lsof available)\033[0m"; \
		fi; \
		echo ""; \
	done
	@echo ""
	@echo -e "\033[36mService response test:\033[0m"
	@if curl -s http://localhost:$(FRONTEND_PORT)/ > /dev/null 2>&1; then \
		echo -e "\033[32m✅ Port $(FRONTEND_PORT) is responding\033[0m"; \
		echo ""; \
		echo -e "\033[36m🌐 Try accessing:\033[0m"; \
		echo -e "\033[36m   • http://localhost:$(FRONTEND_PORT)\033[0m"; \
		echo ""; \
		echo -e "\033[33m💡 If port forwarding isn't working in Coder:\033[0m"; \
		echo -e "\033[33m   1. Check the 'Ports' tab in Coder\033[0m"; \
		echo -e "\033[33m   2. Manually add port $(FRONTEND_PORT) if not auto-detected\033[0m"; \
		echo -e "\033[33m   3. Ensure the port is set to 'Public' for external access\033[0m"; \
		echo -e "\033[33m   4. Try accessing from browser: http://localhost:$(FRONTEND_PORT)\033[0m"; \
	else \
		echo -e "\033[31m❌ Port $(FRONTEND_PORT) is not responding\033[0m"; \
		echo -e "\033[33m💡 Start the service with: make dev\033[0m"; \
	fi

check-stray: ## Check for stray processes that might be outputting to terminal
	@echo -e "\033[34mChecking for stray processes...\033[0m"
	@echo -e "\033[34m============================\033[0m"
	@echo ""
	@echo -e "\033[36mNode processes related to frontend:\033[0m"
	@ps aux | grep -E "(next|npm|node)" | grep -v grep || echo -e "\033[33mNo frontend processes found\033[0m"
	@echo ""
	@echo -e "\033[36mProcesses that might be writing to terminal:\033[0m"
	@ps aux | grep -E "(next|npm|node)" | grep -v grep | grep -E "(pts|tty)" || echo -e "\033[33mNo processes writing to terminal found\033[0m"
	@echo ""
	@echo -e "\033[36mProcesses using port $(FRONTEND_PORT):\033[0m"
	@if command -v ss >/dev/null 2>&1; then \
		ss -tlnp | grep ":$(FRONTEND_PORT) " || echo -e "\033[33mNo processes found using port $(FRONTEND_PORT)\033[0m"; \
	elif command -v netstat >/dev/null 2>&1; then \
		netstat -tlnp | grep ":$(FRONTEND_PORT) " || echo -e "\033[33mNo processes found using port $(FRONTEND_PORT)\033[0m"; \
	elif command -v lsof >/dev/null 2>&1; then \
		lsof -i:$(FRONTEND_PORT) || echo -e "\033[33mNo processes found using port $(FRONTEND_PORT)\033[0m"; \
	else \
		echo -e "\033[33mCannot check port usage (no ss/netstat/lsof available)\033[0m"; \
	fi
	@echo ""
	@echo -e "\033[33m💡 If you see unwanted output, try:\033[0m"
	@echo -e "\033[33m   • make clean-tail (to kill stray tail processes)\033[0m"
	@echo -e "\033[33m   • make dev-clean (to stop all processes)\033[0m"
	@echo -e "\033[33m   • make dev (to restart with nohup)\033[0m"
	@echo -e "\033[33m   • make force-kill-port (to forcefully kill port usage)\033[0m"

force-kill-port: ## Forcefully kill any process using the frontend port
	@echo -e "\033[34mForcefully killing any process using port $(FRONTEND_PORT)...\033[0m"
	@echo -e "\033[33mKilling all Node.js and npm processes...\033[0m"
	@pkill -f "npm.*dev-coder" 2>/dev/null || true
	@pkill -f "npm.*start-coder" 2>/dev/null || true
	@pkill -f "next.*dev" 2>/dev/null || true
	@pkill -f "next.*start" 2>/dev/null || true
	@pkill -f "node.*next" 2>/dev/null || true
	@pkill -f "turbo.*dev" 2>/dev/null || true
	@pkill -f "turbo.*start" 2>/dev/null || true
	@pkill -f "next" 2>/dev/null || true
	@pkill -f "turbo" 2>/dev/null || true
	@echo -e "\033[33mForcefully killing any remaining processes on ports $(FRONTEND_PORT) and $(FRONTEND_BUILD_PORT)...\033[0m"
	@for port in $(FRONTEND_PORT) $(FRONTEND_BUILD_PORT); do \
		if command -v lsof >/dev/null 2>&1; then \
			lsof -ti:$$port | xargs -r kill -9 2>/dev/null || true; \
	if command -v lsof >/dev/null 2>&1; then \
		lsof -ti:$$port | xargs -r kill -9 2>/dev/null || true; \
	elif command -v ss >/dev/null 2>&1; then \
		ss -tlnp | grep ":$$port " | sed 's/.*pid=\([0-9]*\).*/\1/' | xargs -r kill -9 2>/dev/null || true; \
	elif command -v netstat >/dev/null 2>&1; then \
		netstat -tlnp | grep ":$$port " | awk '{print $$7}' | sed 's/\/.*//' | xargs -r kill -9 2>/dev/null || true; \
	fi; \
	done
	@echo -e "\033[32m✅ Ports $(FRONTEND_PORT) and $(FRONTEND_BUILD_PORT) should now be free\033[0m"

dev-status: ## Show status of all services
	@echo -e "\033[34mFrontend Development Environment Status\033[0m"
	@echo -e "\033[34m=====================================\033[0m"
	@echo ""
	@for pid_file in $(PID_DIR)/*.pid; do \
		if [ -f "$$pid_file" ]; then \
			pid=$$(cat "$$pid_file"); \
			service=$$(basename "$$pid_file" .pid); \
			if ps -p $$pid > /dev/null 2>&1; then \
				echo -e "\033[32m✅ $$service (PID: $$pid) - RUNNING\033[0m"; \
			else \
				echo -e "\033[31m❌ $$service (PID: $$pid) - STOPPED\033[0m"; \
				rm -f "$$pid_file"; \
			fi; \
		fi; \
	done
	@echo ""
	@if [ ! -f "$(PID_DIR)/frontend.pid" ]; then \
		echo -e "\033[33mNo services are currently running.\033[0m"; \
	fi

dev-logs: ## Show logs from all services
	@printf "\033[34mFrontend Development Environment Logs\033[0m\n"
	@printf "\033[34m====================================\033[0m\n"
	@echo ""
	@for log_file in $(LOG_DIR)/*.log; do \
		if [ -f "$$log_file" ]; then \
			service=$$(basename "$$log_file" .log); \
			if [ "$$service" = "frontend" ]; then \
				printf "\033[36m📋 [FRONT] $$service logs:\033[0m\n"; \
				printf "\033[36m----------------------------------------\033[0m\n"; \
				tail -n 20 "$$log_file" 2>/dev/null | while read line; do printf "\033[36m[FRONT]\033[0m $$line\n"; done || printf "\033[33mNo logs available\033[0m\n"; \
			else \
				printf "\033[33m📋 [OTHER] $$service logs:\033[0m\n"; \
				printf "\033[33m----------------------------------------\033[0m\n"; \
				tail -n 20 "$$log_file" 2>/dev/null | while read line; do printf "\033[33m[OTHER]\033[0m $$line\n"; done || printf "\033[33mNo logs available\033[0m\n"; \
			fi; \
			echo ""; \
		fi; \
	done

dev-tail: ## Tail logs from all services in real-time
	@printf "\033[34mTailing logs from all services (Ctrl+C to stop)...\033[0m\n"
	@if [ -d "$(LOG_DIR)" ] && [ "$$(ls -A $(LOG_DIR))" ]; then \
		TAIL_PIDS_FILE=$$(mktemp); \
		( \
			trap 'echo ""; echo -e "\033[33m🛑 Stopping tail processes...\033[0m"; if [ -f "$$TAIL_PIDS_FILE" ]; then for pid in $$(cat "$$TAIL_PIDS_FILE"); do kill -TERM $$pid 2>/dev/null; done; sleep 0.5; for pid in $$(cat "$$TAIL_PIDS_FILE"); do kill -9 $$pid 2>/dev/null; done; rm -f "$$TAIL_PIDS_FILE"; fi; echo -e "\033[32m✅ Stopped tailing logs\033[0m"; exit 0' INT TERM; \
			tail -f $(LOG_DIR)/frontend.log 2>/dev/null | while read line; do printf "\033[36m[FRONT]\033[0m $$line\n"; done & echo $$! >> "$$TAIL_PIDS_FILE"; \
			wait \
		); \
		rm -f "$$TAIL_PIDS_FILE" 2>/dev/null; \
	else \
		printf "\033[33mNo log files found. Start services first with 'make dev'\033[0m\n"; \
	fi

dev-tail-stop: ## Stop tailing logs and clean up any stray tail processes
	@echo -e "\033[34mStopping tail processes and cleaning up...\033[0m"
	@$(MAKE) clean-tail
	@echo -e "\033[32m✅ Tail processes stopped and cleaned up\033[0m"

health: ## Check if all services are running and healthy
	@echo -e "\033[34mHealth Check\033[0m"
	@echo -e "\033[34m===========\033[0m"
	@echo ""
	@$(MAKE) dev-status
	@echo ""
	@echo -e "\033[34mChecking frontend endpoints...\033[0m"
	@for port in $(FRONTEND_PORT) $(FRONTEND_BUILD_PORT); do \
		echo -e "\033[36mChecking port $$port...\033[0m"; \
		if curl -s http://127.0.0.1:$$port/ > /dev/null 2>&1; then \
			echo -e "\033[32m✅ Port $$port is responding\033[0m"; \
	else \
			echo -e "\033[31m❌ Port $$port is not responding\033[0m"; \
		fi; \
	done
	@echo ""
	@echo -e "\033[34mChecking port exposure for Coder...\033[0m"
	@for port in $(FRONTEND_PORT) $(FRONTEND_BUILD_PORT); do \
		if curl -s http://localhost:$$port/ > /dev/null 2>&1; then \
			echo -e "\033[32m✅ Port $$port is responding and accessible\033[0m"; \
		echo -e "\033[36m🌐 Service bound to 0.0.0.0 for Coder compatibility\033[0m"; \
		else \
			echo -e "\033[31m❌ Port $$port is not responding\033[0m"; \
		fi; \
	done

debug: ## Comprehensive debugging information
	@echo -e "\033[34mComprehensive Debug Information\033[0m"
	@echo -e "\033[34m=============================\033[0m"
	@echo ""
	@echo -e "\033[36m1. Service Status:\033[0m"
	@$(MAKE) dev-status
	@echo ""
	@echo -e "\033[36m2. Port Usage:\033[0m"
	@$(MAKE) check-ports
	@echo ""
	@echo -e "\033[36m3. Stray Processes:\033[0m"
	@$(MAKE) check-stray
	@echo ""
	@echo -e "\033[36m4. PID Files:\033[0m"
	@if [ -d "$(PID_DIR)" ]; then \
		for pid_file in $(PID_DIR)/*.pid; do \
			if [ -f "$$pid_file" ]; then \
				pid=$$(cat "$$pid_file"); \
				service=$$(basename "$$pid_file" .pid); \
				if ps -p $$pid > /dev/null 2>&1; then \
					echo -e "\033[32m✅ $$service.pid exists (PID: $$pid) - RUNNING\033[0m"; \
				else \
					echo -e "\033[31m❌ $$service.pid exists (PID: $$pid) - DEAD\033[0m"; \
				fi; \
			fi; \
		done; \
	else \
		echo -e "\033[33mNo PID directory found\033[0m"; \
	fi
	@echo ""
	@echo -e "\033[36m5. Log Files:\033[0m"
	@if [ -d "$(LOG_DIR)" ]; then \
		for log_file in $(LOG_DIR)/*.log; do \
			if [ -f "$$log_file" ]; then \
				service=$$(basename "$$log_file" .log); \
				size=$$(stat -c%s "$$log_file" 2>/dev/null || echo "0"); \
				echo -e "\033[36m📋 $$service.log ($$size bytes)\033[0m"; \
			fi; \
		done; \
	else \
		echo -e "\033[33mNo log directory found\033[0m"; \
	fi

# =============================================================================
# INDIVIDUAL SERVICE MANAGEMENT
# =============================================================================

start-frontend: ## Start frontend service
	@echo -e "\033[36mStarting frontend service on port $(FRONTEND_PORT)...\033[0m"
	@if [ "$(HOT_RELOAD)" = "true" ]; then \
		echo -e "\033[36m🔥 Starting with hot reload (dev-coder)...\033[0m"; \
		nohup $(NODE) run dev-coder > $(LOG_DIR)/frontend.log 2>&1 & echo $$! > $(PID_DIR)/frontend.pid; \
	else \
		echo -e "\033[36m🏗️  Building first, then starting (start-coder)...\033[0m"; \
		$(NODE) run build; \
		nohup $(NODE) run start-coder > $(LOG_DIR)/frontend.log 2>&1 & echo $$! > $(PID_DIR)/frontend.pid; \
	fi
	@echo -e "\033[32m✅ frontend started (PID: $$(cat $(PID_DIR)/frontend.pid))\033[0m"
	@echo -e "\033[36m🌐 Service accessible at: http://localhost:$(FRONTEND_PORT)\033[0m"

stop-frontend: ## Stop frontend service
	@if [ -f "$(PID_DIR)/frontend.pid" ]; then \
		pid=$$(cat $(PID_DIR)/frontend.pid); \
		echo "Stopping frontend (PID: $$pid)..."; \
		kill -TERM $$pid 2>/dev/null || true; \
		rm -f $(PID_DIR)/frontend.pid; \
		echo "✅ frontend stopped"; \
	else \
		echo "frontend is not running"; \
	fi

# =============================================================================
# SERVICE-SPECIFIC LOGS
# =============================================================================

logs-frontend: ## Show frontend logs
	@if [ -f "$(LOG_DIR)/frontend.log" ]; then \
		printf "\033[36m📋 [FRONT] frontend logs:\033[0m\n"; \
		printf "\033[36m----------------------------------------\033[0m\n"; \
		tail -n 50 $(LOG_DIR)/frontend.log | while read line; do printf "\033[36m[FRONT]\033[0m $$line\n"; done; \
	else \
		printf "\033[33mNo frontend logs found\033[0m\n"; \
	fi 