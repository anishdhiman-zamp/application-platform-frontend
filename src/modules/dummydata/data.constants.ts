import { ColDef } from "ag-grid-community";

export const dummyColumns = [
    { field: 'name', filter: 'agTextColumnFilter', flex: 1 },
    {
        field: 'age', filter: 'agNumberColumnFilter', flex: 1,
        // filterParams: {
        //     filterOptions: ['contains', 'equals', 'startsWith'], // Specify allowed options
        // }
    },
    {
        field: 'country',
        type: 'amount',
        filter: 'agMultiColumnFilter',
        // filterParams: {
        //     values: ["USA", "Canada",], // Dynamic values from external JSON
        //     filterOptions: ['contains', 'equals', 'startsWith'], // Specify allowed options from frontend
        //     width: '400px',
        // },
        flex: 1
    },
    {
        field: 'date',
        filter: 'agDateColumnFilter',
        flex: 1
    },
];
export const dummyData = [
    { "name": "John Doe", "age": 25, "country": "USA", "date": "2024-01-01" },
    { "name": "Jane Smith", "age": 30, "country": "Canada", "date": "2024-01-01" },
    { "name": "Raj Patel", "age": 35, "country": "India", "date": "2024-01-01" },
    { "name": "Hans Zimmer", "age": 40, "country": "Germany", "date": "2024-01-01" },
    { "name": "Marie Curie", "age": 28, "country": "France", "date": "2024-01-01" }
];



export const test = {
    "accountId": "ACC_M1_005",
    "accountType": "RESERVE",
    "amountPrecision": 2,
    "closingBalanceDecimalAmount": 89,
    "closingBalanceIntegerAmount": 21384,
    "closingBalancePrecision": 2,
    "closingBalanceStringAmount": 21384.89,
    "currencyCode": "AUD",
    "decimalAmount": 1,
    "description": "Customer payment",
    "fundType": "REGULAR",
    "id": "TXN_0",
    "integerAmount": 5109,
    "isDeleted": 0,
    "isTagged": 0,
    "ladderingIndex": 0,
    "merchantId": "MERCH_GT_001",
    "postedTimeStampUTC": 1704067200,
    "remarks": "Transaction at 2024-01-01 00:00:00",
    "status": "COMPLETED",
    "stringAmount": "5109.1",
    "transactionInitiatedAt": "2024-01-01T00:00:00Z",
    "transactionType": "CREDIT",
    "transactionUpdatedAt": "2024-01-01T00:00:00Z",
    "valueTimeStampUTC": 1704067200
}

export const testColumns = [
    {
        "name": "Id",
        "database_type": "STRING"
    },
    {
        "name": "AccountType",
        "database_type": "STRING"
    },
    {
        "name": "AccountId",
        "database_type": "STRING"
    },
    {
        "name": "TransactionType",
        "database_type": "STRING"
    },
    {
        "name": "FundType",
        "database_type": "STRING"
    },
    {
        "name": "Status",
        "database_type": "STRING"
    },
    {
        "name": "IntegerAmount",
        "database_type": "BIGINT"
    },
    {
        "name": "DecimalAmount",
        "database_type": "BIGINT"
    },
    {
        "name": "AmountPrecision",
        "database_type": "BIGINT"
    },
    {
        "name": "StringAmount",
        "database_type": "STRING"
    },
    {
        "name": "CurrencyCode",
        "database_type": "STRING"
    },
    {
        "name": "Remarks",
        "database_type": "STRING"
    },
    {
        "name": "LadderingIndex",
        "database_type": "BIGINT"
    },
    {
        "name": "ClosingBalanceIntegerAmount",
        "database_type": "BIGINT"
    },
    {
        "name": "ClosingBalanceDecimalAmount",
        "database_type": "BIGINT"
    },
    {
        "name": "ClosingBalanceStringAmount",
        "database_type": "FLOAT"
    },
    {
        "name": "ClosingBalancePrecision",
        "database_type": "BIGINT"
    },
    {
        "name": "TransactionInitiatedAt",
        "database_type": "DATE"
    },
    {
        "name": "TransactionUpdatedAt",
        "database_type": "DATE"
    },
    {
        "name": "Description",
        "database_type": "STRING"
    },
    {
        "name": "MerchantId",
        "database_type": "STRING"
    },
    {
        "name": "IsTagged",
        "database_type": "BIGINT"
    },
    {
        "name": "PostedTimeStampUTC",
        "database_type": "BIGINT"
    },
    {
        "name": "ValueTimeStampUTC",
        "database_type": "BIGINT"
    },
    {
        "name": "IsDeleted",
        "database_type": "INT"
    }
]

export const LISTING_COLUMNS:ColDef[] = [
    {
        field: "title",
        headerName:"Name"
    },
    {
        field: "description",
        headerName: "Description"
    },
    {
        field: "updated_at",
        headerName: "Last Updated"
    }
]