export const ACTIVITY_LOGS_SUMMARY_MOCK_DATA = {
  summary: [
    {
      id: 1,
      title: 'Invoices',
      fields: [
        {
          id: 1,
          label: 'Invoice Number',
          value: 'INV-123456',
        },
        {
          id: 2,
          label: 'Invoice Date',
          value: '2021-01-01',
        },
        {
          id: 3,
          label: 'Term',
          value: 'Net 30',
        },
        {
          id: 4,
          label: 'Total Amount',
          value: '$100',
        },
        {
          id: 5,
          label: 'PO Reference Number',
          value: 'PO-123456',
        },
      ],
    },
    {
      id: 2,
      title: 'PO',
      fields: [
        {
          id: 1,
          label: 'PO Reference Number',
          value: 'PO-123456',
        },
        {
          id: 2,
          label: 'PO Date',
          value: '2021-01-01',
        },
        {
          id: 3,
          label: 'Due Date',
          value: '2021-01-01',
        },
        {
          id: 4,
          label: 'Total Amount',
          value: '$100',
        },
      ],
    },
  ],
  artifacts: [
    {
      id: '50b23011-07a4-449c-b658-9ccc6f47111a',
      artifact_type: 'email',
      display_name: 'Sub: Tax Invoice #4626343 - National Crime Check',
    },
    {
      id: '50b23011-07a4-449c-b658-9ccc6f47111b',
      artifact_type: 'document',
      display_name: 'INV-NCC-4626343.pdf',
    },
  ],
};
