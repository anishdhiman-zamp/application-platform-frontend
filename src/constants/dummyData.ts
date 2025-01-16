import { ColDef, IServerSideGetRowsParams } from "ag-grid-community";

export const PAGES_ITEMS = [
  {
    label: 'Daily Liquidity Summary',
    iconId: 'notebook',
  },
  {
    label: 'Cash Summary',
    iconId: 'notebook',
  },
  {
    label: 'Bank Account Balances',
    iconId: 'notebook',
  }, {
    label: 'Cash Positioning',
    iconId: 'notebook',
  },
];

export const WORKSPACE_ITEMS = [
  {
    label: 'Reconciliation',
    workspace_id: 'reconciliation',
    color: '#40A97F',
  },
  {
    label: 'Cash Management',
    workspace_id: 'cash-management',
    color: '#0052D6',
  },
  {
    label: 'Financial Forecasting',
    workspace_id: 'financial-forecasting',
    color: '#BF0000',
  },
];

export const columnDefs: ColDef[] = [
  { field: 'country' },
  { field: 'year' },
  { field: 'sport' },
  { field: 'total' },
  { field: 'athlete' },
  { field: 'age' },
  { field: 'date' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
];

export interface IOlympicData {
  athlete: string;
  age: number;
  country: string;
  year: number;
  date: string;
  sport: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

export const getDummyRows = (params: IServerSideGetRowsParams) => {
  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then((resp) => resp.json())
    .then((data: IOlympicData[]) => {
      const { sortModel, rowGroupCols, groupKeys } = params.request;

      if (sortModel.length > 0) {
        sortModel.forEach((sort) => {
          data.sort((a, b) => {
            if (sort.sort === 'asc') {
              return `${a?.[sort.colId as keyof IOlympicData]}`.localeCompare(
                `${b?.[sort.colId as keyof IOlympicData]}`,
              );
            } else {
              return `${b?.[sort.colId as keyof IOlympicData]}`.localeCompare(
                `${a?.[sort.colId as keyof IOlympicData]}`,
              );
            }
          });
        });
      }
      let columnValues: string[] = [];
      const column = rowGroupCols[0];

      if (rowGroupCols.length > 0) {
        if (groupKeys.length > 0) {
          const groupData = data.filter((item) => item[column.field as keyof IOlympicData] === groupKeys[0]);

          params.success({
            rowData: groupData.slice(params.request.startRow, params.request.endRow),
            rowCount: groupData.length,
          });
        } else {
          columnValues = Array.from(new Set(data.map((item) => `${item[column.field as keyof IOlympicData]}`)));
          params.success({
            rowData: columnValues
              .slice(params.request.startRow, params.request.endRow)
              .map((value) => ({ [`${column.field}`]: value })),
            rowCount: columnValues.length,
          });
        }
      } else {
        params.success({
          rowData: data.slice(params.request.startRow, params.request.endRow),
          rowCount: data.length,
        });
      }
    });
};


export const barGraphInstance = {
  "instance_id": "currency_volume_analysis",
  "widget_id": 1,
  "type": "bar",
  "title": "Transaction Volume by Currency",
  "data_mappings": {
    "datasets": [{
      "id": "CashOpsBankTransactions",
    }],
    "mappings": {
      "x_axis": {
        "field": "CurrencyCode",
      },
      "y_axis": {
        "field": "IntegerAmount",
        "aggregation": "sum",
      }
    },
  },
  "visual_config": {}
}

export const barGraphData = {
  "result": [{
    "status": "success",
    "error": null,
    "rowcount": 5,
    "columns": [
      {
        "column_name": "CurrencyCode",
        "column_type": "STRING"
      },
      {
        "column_name": "SUM(IntegerAmount)",
        "column_type": "NUMBER"
      }
    ],
    "data": [
      {
        "CurrencyCode": "USD",
        "IntegerAmount": 1543437.00,
        "IntegerAmountV2": 1543437.00
      },
      {
        "CurrencyCode": "EUR",
        "IntegerAmount": 756909.00,
        "IntegerAmountV2": 756909.00
      },
      {
        "CurrencyCode": "GBP",
        "IntegerAmount": 432224.00,
        "IntegerAmountV2": 432224.00
      },
      {
        "CurrencyCode": "JPY",
        "IntegerAmount": 234567.00,
        "IntegerAmountV2": 234567.00
      },
      {
        "CurrencyCode": "SGD",
        "IntegerAmount": 123456.00,
        "IntegerAmountV2": 123456.00
      }
    ]
  }]
}