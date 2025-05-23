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

export const MOCK_EMAIL_ARTIFACT = `<div>
  <p>Hi <strong>John</strong>,</p>

  <p>
    Thank you for reaching out. We're excited to have you on board!
  </p>

  <p>
    Here's a quick summary of your registration:
  </p>

  <ul>
    <li><strong>Email:</strong> john.doe@example.com</li>
    <li><strong>Plan:</strong> Pro (Monthly)</li>
    <li><strong>Status:</strong> Active</li>
  </ul>

  <p>
    You can manage your account by visiting your <a href="https://example.com/dashboard" target="_blank" style="color: #1a73e8;">dashboard</a>.
  </p>

  <p>Let us know if you need any help.</p>

  <p>Best regards,<br>The Example Team</p>

  <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />

  <p style="font-size: 12px; color: #999;">
    This email was sent to you as part of your subscription to Example.com. If you no longer wish to receive emails, you may
    <a href="https://example.com/unsubscribe" style="color: #999;">unsubscribe here</a>.
  </p>
</div>`;
