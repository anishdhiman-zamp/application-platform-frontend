# Mercury Integration Guide

Connect your Mercury banking account to automatically sync transactions, track balances, and streamline financial operations.

## Prerequisites

- A Mercury business bank account
- Admin access to Mercury dashboard
- API access enabled

## Setup Instructions

### Step 1: Enable API Access

1. Log in to [Mercury Dashboard](https://mercury.com)
2. Go to **Settings** → **Integrations**
3. Enable **API Access**
4. Generate an API token

### Step 2: Connect to Zamp

1. Navigate to **Integrations** → **Mercury**
2. Click **Connect**
3. Enter your API token
4. Select accounts to sync
5. Click **Authorize**

### Step 3: Configure Sync

Choose your sync preferences:

| Setting         | Options                       |
| --------------- | ----------------------------- |
| Sync Frequency  | Real-time, Hourly, Daily      |
| Historical Data | Last 30, 90, 365 days, or All |
| Account Types   | Checking, Savings, All        |

## Available Data

### Account Information

- 💰 Current balances
- 📈 Available balances
- 🏦 Account details
- 📋 Account statements

### Transactions

- All deposits and withdrawals
- Wire transfers
- ACH transactions
- Card transactions
- Internal transfers

### Transaction Details

```
Transaction Record
├── Date & Time
├── Amount
├── Type (Credit/Debit)
├── Description
├── Category
├── Counterparty
└── Reference ID
```

## Features

### Automatic Categorization

Transactions are automatically categorized:

- 💼 Payroll
- 🏢 Rent & Utilities
- 💻 Software & Tools
- ✈️ Travel
- 📦 Supplies
- 📊 And more...

### Cash Flow Insights

- Daily/weekly/monthly cash flow
- Runway calculations
- Burn rate tracking
- Balance projections

### Reconciliation

- Match transactions to invoices
- Identify discrepancies
- Export for accounting

## Security

🔐 **Bank-level Security**

- Read-only access (no transaction initiation)
- Encrypted data transmission
- SOC 2 Type II compliant
- No credential storage

## Troubleshooting

### Sync Delays

Mercury transactions may take up to 24 hours to appear. For faster updates:

1. Use the manual sync button
2. Check Mercury's transaction status
3. Verify pending transactions are cleared

### Missing Transactions

- Ensure the date range includes the transaction
- Check if the account is selected for sync
- Verify the transaction is not pending
