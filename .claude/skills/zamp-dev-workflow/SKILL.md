---
name: zamp-dev-workflow
description: Automates zamp service management and browser verification for frontend development. Use when making UI changes, testing frontend features, starting/stopping services, or when the user asks to verify changes in the browser. Handles service startup, Coder URL construction, and iterative browser verification loop.
---

# Zamp Development Workflow

Automates the development loop: start services, make changes, verify in browser, iterate until complete.

## Quick Start

1. Run setup (syncs env): `zamp setup`
   - If it says "Setup already completed", run: `zamp reset-setup && zamp setup`
2. Check services: `zamp dev-status`
3. Get browser URL: `./zamp-auto-start.sh --url-only`
4. Make changes → verify in browser → iterate

## Workflow Steps

### Step 1: Check Service Status

```bash
zamp dev-status
```

### Step 2: Start Services (if needed)

If services are not running, ask the user which services to start:

```
AskQuestion:
  title: "Service Selection"
  questions:
    - id: "services"
      prompt: "Which services do you want to start?"
      options:
        - id: "1,2h"
          label: "Pantheon + Frontend with hot reload (recommended)"
        - id: "1,2"
          label: "Pantheon + Frontend (no hot reload)"
        - id: "all+h"
          label: "All services with hot reload"
        - id: "custom"
          label: "Let me specify custom services"
```

Start selected services:

```bash
echo "<user_selection>" | zamp dev
```

### Step 3: Get Browser URL

```bash
./zamp-auto-start.sh --url-only
```

### Step 4: Login to the App

**IMPORTANT**: If you see the error "A valid session was detected and thus login is not possible", you are already logged in. Just navigate directly to the dashboard:

```
browser_navigate(url: "<coder-url>/processes")
```

Test credentials (if not logged in):

- **Email**: `admin@zamp.ai`
- **Password**: `Zamp@123Zamp@!@#`

Login flow:

```
# Screen 1: Enter email
browser_fill(ref: "<email_input_ref>", value: "admin@zamp.ai")
browser_click(ref: "<login_button_ref>")
browser_wait_for(time: 2)

# Screen 2: Enter password (check screenshot - if "valid session" error, skip to dashboard)
browser_fill(ref: "<password_input_ref>", value: "Zamp@123Zamp@!@#")
browser_click(ref: "<submit_button_ref>")
browser_wait_for(time: 3)
```

### Step 5: Navigate and Verify

Use cursor-ide-browser MCP tools:

```
browser_navigate(url: "<coder-url>")
browser_snapshot()  # See page structure
browser_click(ref: "element_ref")
browser_fill(ref: "input_ref", value: "text")
browser_wait_for(time: 2)
```

### Step 6: Development Loop

```
┌────────────────────────────────────────┐
│         DEVELOPMENT LOOP               │
├────────────────────────────────────────┤
│ 1. Make code changes                   │
│ 2. Wait for hot reload (~2-3s)         │
│ 3. browser_snapshot() to verify        │
│ 4. If not correct → go to step 1       │
│ 5. When complete → confirm with user   │
└────────────────────────────────────────┘
```

## Service Commands

| Command                   | Description             |
| ------------------------- | ----------------------- |
| `zamp dev-status`         | Check running services  |
| `echo "1,2h" \| zamp dev` | Start specific services |
| `zamp dev-stop`           | Stop all services       |
| `zamp dev-logs`           | View logs               |

## Additional Resources

- For service details and troubleshooting, see [reference.md](reference.md)
