# Zamp Dev Workflow Reference

Detailed reference for services, troubleshooting, and configuration.

## Environment Setup

The `NEXT_PUBLIC_BASE_API_URL` environment variable must be correctly set for the frontend to communicate with the backend API.

### Sync Environment

Use `zamp setup` to sync environment variables (including `NEXT_PUBLIC_BASE_API_URL`):

```bash
zamp setup
```

**IMPORTANT**: If `zamp setup` shows "Setup already completed", reset and run again:

```bash
zamp reset-setup
zamp setup
```

The `zamp-auto-start.sh` script handles this automatically - it detects when setup was already completed and resets before running again.

### Env Files Updated

- `.env.local` (root)
- `apps/application-dashboard/.env.local`

## Available Services

| #   | Service                       | Port | Description                  |
| --- | ----------------------------- | ---- | ---------------------------- |
| 1   | pantheon                      | 8080 | Backend API server           |
| 2   | application-platform-frontend | 2000 | Frontend Next.js app         |
| 3   | application-platform          | -    | Application platform backend |
| 4   | data_platform                 | -    | Data platform services       |

## Service Selection Syntax

- **Numbers**: `1,3,4` (normal mode)
- **Numbers with hot reload**: `1h,2h,3h`
- **Mixed**: `1h,3,4h` (some hot reload, some normal)
- **All**: `all` or `all+h`

## Key Ports

| Port      | Service            |
| --------- | ------------------ |
| 2000      | Frontend (Next.js) |
| 8080      | Pantheon API       |
| 4433-4434 | Auth service       |

## Browser URL Construction

The Coder environment provides variables for URL construction.

**Method 1** - Use helper script (recommended):

```bash
./zamp-auto-start.sh --url-only
```

**Method 2** - From VSCODE_PROXY_URI (Cursor terminal):

```bash
BROWSER_URL="${VSCODE_PROXY_URI//\{\{port\}\}/2000}"
```

**Method 3** - From individual Coder variables (any terminal):

```bash
echo "https://2000--${CODER_WORKSPACE_AGENT_NAME}--${CODER_WORKSPACE_NAME}--${CODER_WORKSPACE_OWNER_NAME}.coder-live.zamp.dev"
```

## Test Credentials

**Screen 1 - Email Entry:**

- Email: `admin@zamp.ai`

**Screen 2 - Password Entry:**

- Username: `admin@zamp.ai`
- Password: `Zamp@123Zamp@!@#`

## Troubleshooting

### "Valid Session Detected" Login Error

If you see the error:

> "A valid session was detected and thus login is not possible. Did you forget to set `?refresh=true`?"

**Solution**: You are already logged in. Simply navigate to the dashboard:

```
browser_navigate(url: "<coder-url>/processes")
```

Or refresh the page and it will redirect to the dashboard automatically.

### Services Not Running

```bash
zamp dev-status
zamp dev-stop
./zamp-auto-start.sh --services "1,2h"
```

### Browser URL Not Working

1. Check if in Coder environment: `echo $CODER`
2. Verify URL template: `echo $VSCODE_PROXY_URI`
3. Check Ports panel in VS Code for forwarded ports

### Hot Reload Not Working

1. Ensure service started with `h` suffix (e.g., `2h` not `2`)
2. Check logs: `zamp dev-logs`
3. Restart: `zamp dev-stop && ./zamp-auto-start.sh --services "1,2h"`

### Browser URL Empty

Use individual Coder variables:

```bash
echo "https://2000--${CODER_WORKSPACE_AGENT_NAME}--${CODER_WORKSPACE_NAME}--${CODER_WORKSPACE_OWNER_NAME}.coder-live.zamp.dev"
```

## Files Reference

| File                                         | Purpose                                         |
| -------------------------------------------- | ----------------------------------------------- |
| `zamp-auto-start.sh`                         | Automation script for setup and service startup |
| `.cursor/skills/zamp-dev-workflow/SKILL.md`  | AI agent skill instructions                     |
| `.cursor/skills/zamp-dev-workflow/README.md` | Human-readable documentation                    |
| `.cursor/rules/project-guidelines.mdc`       | Frontend coding guidelines                      |
