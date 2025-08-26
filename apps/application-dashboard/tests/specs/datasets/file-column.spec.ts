/* eslint-disable absolute-imports/only-absolute-imports */
import { wrapAgTestIdFor } from 'ag-grid-community';
import { PLAYWRIGHT_ENV_CREDENTIALS } from '../../../playwright.config';
import { expect, test } from '../../session_management/cdp-test-setup';
import {
  openDocumentDetailsIfPresent,
  selectAvailableDataset,
  selectAvailableOrganisation,
} from './dataset.test.utils';

test.describe('File Column', () => {
  test('should navigate to Organisation and open datasets page', async ({ page }) => {
    const { baseUrl } = PLAYWRIGHT_ENV_CREDENTIALS;
    const agIdFor = wrapAgTestIdFor((testId: string) => page.getByTestId(testId));

    await test.step('Navigate to home page', async () => {
      await page.goto(baseUrl);
    });

    await test.step('Open org switcher and select an available org', async () => {
      await selectAvailableOrganisation(page, baseUrl, 'stripe');
    });

    await test.step('Navigate to datasets page and verify columns', async () => {
      await page.goto(`${baseUrl}/datasets`);
      await expect(agIdFor.headerCell('title')).toBeVisible();
      await expect(agIdFor.headerCell('description')).toBeVisible();
    });

    await test.step('Click on an available dataset', async () => {
      await selectAvailableDataset(page, 'Invoices');
    });

    await test.step('Verify Dataset Table', async () => {
      const datasetTable = page.getByTestId('dataset-table');

      await datasetTable.waitFor({ state: 'visible', timeout: 10000 });
      await expect(datasetTable).toBeVisible();
    });

    await test.step('Verify Document Details Column if available', async () => {
      await openDocumentDetailsIfPresent(page);
      console.log('✅ Document details opened');
    });
  });
});
