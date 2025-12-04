# Jira Integration Guide

Integrate Jira with Zamp to synchronize issues, track sprint progress, and enhance your project management capabilities.

## Prerequisites

- Jira Cloud or Jira Data Center account
- Project admin or site admin permissions
- API token (for Cloud) or application link (for Data Center)

## Setup Instructions

### For Jira Cloud

#### Step 1: Generate API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**
3. Enter a label (e.g., "Zamp Integration")
4. Copy the token immediately

#### Step 2: Connect to Zamp

1. Navigate to **Integrations** → **Jira**
2. Select **Jira Cloud**
3. Enter your:
   - Jira site URL (e.g., `yourcompany.atlassian.net`)
   - Email address
   - API token
4. Click **Connect**

### For Jira Data Center

1. Configure an Application Link in Jira
2. Use OAuth for secure authentication
3. Contact your Jira admin for setup assistance

## Data Sync Options

### Issues

| Field | Sync Direction |
|-------|---------------|
| Summary | ↔️ Two-way |
| Description | ↔️ Two-way |
| Status | ↔️ Two-way |
| Assignee | ↔️ Two-way |
| Priority | ↔️ Two-way |
| Labels | ↔️ Two-way |
| Custom Fields | → One-way (Jira to Zamp) |

### Projects & Sprints

- Project metadata
- Sprint information
- Version/release data
- Components

## Features

### Real-time Sync

Changes in Jira are reflected in Zamp within minutes using webhooks.

### Smart Mapping

Automatically map Jira fields to Zamp columns:

```
Jira Field        →  Zamp Column
─────────────────────────────────
Summary           →  Title
Description       →  Details
Status            →  Status
Priority          →  Priority
Story Points      →  Estimate
```

### JQL Support

Use JQL queries to filter which issues sync:

```jql
project = "PROJ" AND status != Done
```

## Best Practices

1. **Start with one project** - Test with a single project first
2. **Use filters** - Only sync relevant issues
3. **Map statuses** - Align Jira and Zamp workflows
4. **Monitor sync** - Check sync logs regularly

## Troubleshooting

### Authentication Errors

- Verify API token hasn't expired
- Check email address is correct
- Ensure site URL is accurate

### Missing Issues

- Review JQL filters
- Check project permissions
- Verify issue types are included





