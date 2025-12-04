# Square Integration Guide

Connect your Square account to import payment data, track sales, and gain financial insights directly in Zamp.

## Prerequisites

- A Square merchant account
- Owner or admin access to Square Dashboard

## Setup Instructions

### Step 1: Authorize Connection

1. Navigate to **Integrations** → **Square**
2. Click **Connect with Square**
3. Log in to your Square account
4. Review requested permissions
5. Click **Allow**

### Step 2: Select Data to Sync

Choose which data types to import:

- ✅ Transactions
- ✅ Payments
- ✅ Refunds
- ✅ Customers
- ✅ Items & Inventory
- ✅ Locations

### Step 3: Configure Sync Schedule

| Option | Description |
|--------|-------------|
| Real-time | Sync as transactions occur |
| Hourly | Sync every hour |
| Daily | Sync once per day |
| Manual | Sync on demand |

## Available Data

### Transaction Data

- Payment amounts and fees
- Payment methods (card, cash, etc.)
- Timestamps and locations
- Customer information

### Product Data

- Item names and SKUs
- Prices and variations
- Categories
- Inventory levels

### Financial Reports

- Daily sales summaries
- Payment method breakdowns
- Refund tracking
- Fee calculations

## Security

🔒 Your Square data is encrypted in transit and at rest. We use OAuth 2.0 for secure authentication and never store your Square credentials.

## Troubleshooting

### Missing Transactions

1. Check the sync date range
2. Verify location filters
3. Ensure the transaction is completed (not pending)

### Permission Errors

- Re-authorize the connection
- Verify your Square account has the required permissions






