# Notion Integration Guide

Connect Notion to sync databases, import pages, and create a seamless workflow between your documentation and data.

## Prerequisites

- A Notion account (Free or paid)
- Workspace admin permissions
- Databases you want to sync

## Setup Instructions

### Step 1: Connect Notion

1. Go to **Integrations** → **Notion**
2. Click **Connect with Notion**
3. Log in to your Notion account
4. Select pages and databases to share
5. Click **Allow access**

### Step 2: Select Databases

> ⚠️ **Important**: Only pages/databases you explicitly share will be accessible.

1. In Notion, open each database you want to sync
2. Click **•••** → **Connections** → **Zamp**
3. The database will appear in your Zamp integration settings

### Step 3: Configure Mapping

Map Notion properties to Zamp columns:

| Notion Property | Zamp Column Type |
|----------------|------------------|
| Title | Text |
| Number | Number |
| Select | Single Select |
| Multi-select | Tags |
| Date | Date |
| Checkbox | Boolean |
| URL | Link |
| Email | Email |
| Phone | Phone |
| Formula | Computed |
| Relation | Reference |

## Sync Options

### One-way Sync (Notion → Zamp)

Import Notion data into Zamp:

- Read-only in Zamp
- Changes in Notion reflect in Zamp
- Best for documentation and references

### Two-way Sync

Bidirectional synchronization:

- Changes sync both directions
- Conflict resolution options
- Real-time updates

### Manual Sync

On-demand synchronization:

- Sync when you need it
- Full control over timing
- Best for large databases

## Features

### Database Sync

```
Notion Database ←→ Zamp Dataset
├── Properties → Columns
├── Rows → Records
├── Filters → Query conditions
└── Sorts → Ordering
```

### Page Import

- Import Notion pages as rich text
- Preserve formatting and structure
- Embed in Zamp records

### Linked Databases

- Create Notion views from Zamp data
- Embed live Zamp widgets in Notion
- Cross-reference between platforms

## Use Cases

### Documentation

- Link SOPs to process data
- Attach meeting notes to projects
- Reference knowledge base articles

### Project Management

- Sync task databases
- Track OKRs and goals
- Manage roadmaps

### CRM Enhancement

- Link customer notes
- Store relationship history
- Attach deal documentation

## Best Practices

1. **Use consistent naming** - Match property names across platforms
2. **Start small** - Begin with one database
3. **Set sync direction carefully** - Avoid accidental overwrites
4. **Regular cleanup** - Archive unused connections





