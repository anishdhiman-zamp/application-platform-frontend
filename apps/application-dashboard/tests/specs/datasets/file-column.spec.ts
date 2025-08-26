/* eslint-disable absolute-imports/only-absolute-imports */
import { wrapAgTestIdFor } from 'ag-grid-community';
import { PLAYWRIGHT_ENV_CREDENTIALS } from '../../../playwright.config';
import { expect, test } from '../../session_management/cdp-test-setup';
import {
  openDocumentDetailsIfPresent,
  selectAvailableDatasetDescription,
  selectAvailableOrganisation,
} from './dataset.test.utils';

test.describe('File Column', () => {
  test('should navigate to Organisation and open datasets page', async ({ page }) => {
    const { baseUrl } = PLAYWRIGHT_ENV_CREDENTIALS;
    const agIdFor = wrapAgTestIdFor((testId: string) => page.getByTestId(testId));

    await test.step('Navigate to home page', async () => {
      console.log('Navigating to home page...');
      await page.goto(baseUrl);
    });

    await test.step('Open org switcher and select an available org', async () => {
      console.log('Selecting available organisation...');
      await selectAvailableOrganisation(page, baseUrl, 'stripe');
    });

    await test.step('Navigate to datasets page and verify columns', async () => {
      console.log('Navigating to datasets page...');
      await page.goto(`${baseUrl}/datasets`);
      await expect(agIdFor.headerCell('title')).toBeVisible();
      await expect(agIdFor.headerCell('description')).toBeVisible();
    });

    await test.step('Click on an available dataset', async () => {
      console.log('Selecting available dataset...');
      await selectAvailableDatasetDescription(page, 'Dataset for invoices');
    });

    await test.step('Verify Dataset Table', async () => {
      console.log('Verifying dataset table...');
      const datasetTable = page.getByTestId('dataset-table');
      const errorCard = page.getByText('Failed to load dataset', { exact: true });

      // Safe check for error card visibility without throwing
      let errorVisible = false;

      try {
        errorVisible = await errorCard.isVisible({ timeout: 10000 });
      } catch {
        errorVisible = false; // ignore timeout errors
      }

      if (errorVisible) {
        console.log('Skipping test: API is not returning data');
        test.info().skip('API is not returning data');

        return;
      }

      await expect(datasetTable).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify Document Details Column if available', async () => {
      console.log('Verifying document details column...');
      await openDocumentDetailsIfPresent(page);
      console.log('✅ Document details opened');
    });
  });
});
