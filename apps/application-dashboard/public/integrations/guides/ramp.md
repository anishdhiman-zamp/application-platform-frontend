# Ramp Integration Guide

Connect your Ramp corporate card account to automatically sync expenses, receipts, and spending data.

## Prerequisites

- A Ramp corporate card account
- Admin or finance role in Ramp
- API access enabled

## Setup Instructions

### Step 1: Generate API Credentials

1. Log in to [Ramp Dashboard](https://ramp.com)
2. Navigate to **Settings** → **Developer**
3. Create a new API client
4. Copy the Client ID and Secret

### Step 2: Connect to Zamp

1. Go to **Integrations** → **Ramp**
2. Click **Connect**
3. Enter your API credentials
4. Authorize the connection

### Step 3: Configure Data Sync

Select data to import:

- ✅ Transactions
- ✅ Receipts
- ✅ Merchants
- ✅ Cardholders
- ✅ Departments
- ✅ Accounting categories

## Available Data

### Transaction Data

| Field | Description |
|-------|-------------|
| Amount | Transaction amount |
| Merchant | Vendor name |
| Category | Expense category |
| Date | Transaction date |
| Cardholder | Employee name |
| Department | Team/department |
| Memo | Notes and descriptions |
| Receipt | Attached receipt images |

### Spending Analytics

```
Spending Breakdown
├── By Department
│   ├── Engineering: $45,000
│   ├── Marketing: $32,000
│   └── Operations: $28,000
├── By Category
│   ├── Software: $52,000
│   ├── Travel: $23,000
│   └── Office: $15,000
└── By Merchant
    ├── AWS: $18,000
    ├── Google: $12,000
    └── Others: $25,000
```

### Budget Tracking

- Department budgets
- Category limits
- Spending alerts
- Variance reports

## Features

### Automatic Receipt Matching

Receipts uploaded in Ramp automatically sync:

- 📸 Receipt images
- 📝 Extracted data (amount, vendor, date)
- ✅ Verification status

### Real-time Alerts

Get notified in Zamp for:

- Large transactions
- Out-of-policy spending
- Missing receipts
- Budget threshold reached

### Accounting Integration

Prepare data for accounting:

- Category mapping
- GL code assignment
- Export to accounting software
- Reconciliation support

## Reporting

### Built-in Reports

1. **Monthly Spend Summary**
   - Total spending
   - Category breakdown
   - Top merchants
   - Trend analysis

2. **Employee Expenses**
   - Per-employee spending
   - Policy compliance
   - Receipt submission rate

3. **Budget vs Actual**
   - Variance analysis
   - Forecast projections
   - Alert history

## Security

🔒 **Enterprise Security**

- Read-only API access
- No card number exposure
- Encrypted data transfer
- Audit logging

## Troubleshooting

### Missing Transactions

- Transactions sync after they're posted (not pending)
- Check the date range filter
- Verify cardholder is included in sync

### Receipt Sync Issues

- Ensure receipts are uploaded in Ramp
- Check image format compatibility
- Verify sync is enabled for receipts





