# Zamp Development Workflow

This guide explains how to use the automated development workflow with AI agents in the Coder environment.

## Invoking the Skill

The AI agent automatically uses this skill when you describe relevant tasks. Examples:

> "Verify my changes in the browser"

> "Start services and test the UI"

> "Make this button blue and check it works"

You can also be explicit:

> "Use the zamp-dev-workflow skill to verify my changes in the browser"

## Quick Start

### 1. Start Services

```bash
# Navigate to the frontend directory
cd /path/to/zamp/services/application-platform-frontend

# Start pantheon + frontend with hot reload
./zamp-auto-start.sh --services "1,2h"

# Or start all services
./zamp-auto-start.sh --all --hot
```

### 2. Get Browser URL

```bash
./zamp-auto-start.sh --url-only
```

This outputs a URL like:

```
https://2000--main--{workspace}--{username}.coder.dev-mum.internal.zamp.dev
```

### 3. Tell the AI Agent

When giving tasks to the AI agent, include instructions like:

> "Verify your changes in the browser at the Coder URL. Use browser_snapshot to check the UI after each change. Don't mark the task complete until it works in the browser."

## Available Commands

| Command                                  | Description                             |
| ---------------------------------------- | --------------------------------------- |
| `./zamp-auto-start.sh`                   | Interactive mode - prompts for services |
| `./zamp-auto-start.sh --services "1,2h"` | Start specific services                 |
| `./zamp-auto-start.sh --all --hot`       | Start all services with hot reload      |
| `./zamp-auto-start.sh --url-only`        | Just output the browser URL             |
| `./zamp-auto-start.sh --skip-setup`      | Skip the setup check                    |
| `zamp dev-status`                        | Check if services are running           |
| `zamp dev-stop`                          | Stop all services                       |
| `zamp dev-logs`                          | View service logs                       |

## Example Prompts for AI Agent

### Basic Task

> "Change the button color to blue and verify it in the browser."

### With Explicit Verification

> "Add a new 'Settings' link to the navigation. Make sure services are running, then verify the change appears correctly in the browser before marking complete."

### Full Workflow

> "I need to add a search feature to the dashboard. Start by checking `zamp dev-status`, get the browser URL, make the changes, and use browser_snapshot to verify each step works correctly."

## Additional Resources

- For service details and troubleshooting, see [reference.md](reference.md)
- For AI agent instructions, see [SKILL.md](SKILL.md)
