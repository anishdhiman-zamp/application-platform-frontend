/* eslint-disable absolute-imports/only-absolute-imports */

import { PLAYWRIGHT_ENV_CREDENTIALS } from '../../../playwright.config';
import { test } from '../../session_management/cdp-test-setup';
import { chooseOrganization, waitForCondition } from '../../utils/common.utils';
import {
  checkColumnsHidden,
  dragColumnAfter,
  switchToTab,
  toggleColumns,
  validateColumnValues,
  waitForDataLoad,
} from './activity-runs-table.utils';

// Configuration for the test
const activityRunsTableConfig = {
  timeout: 10 * 60 * 1000, // 10 minutes
};

test.describe('Activity-Runs Table and Filters Flow', () => {
  const { baseUrl } = PLAYWRIGHT_ENV_CREDENTIALS;
  const { timeout } = activityRunsTableConfig;

  test('should be able test filter and display options', async ({ page }) => {
    test.setTimeout(timeout);

    // Navigate to processes page
    console.log('Navigating to processes page...');
    await page.goto(`${baseUrl}/processes`);

    await test.step('Open org switcher and select an available org', async () => {
      // select Org
      await chooseOrganization(page, 'Anonymous');

      // Wait for activity runs status tabs to be visible after org switch
      await waitForCondition(
        async () => {
          const statusTabs = page.getByTestId('activity-runs-status-tabs-group');

          return await statusTabs.isVisible();
        },
        {
          maxAttempts: 10,
          pollingInterval: 1000,
          description: 'activity runs status tabs to be visible',
        },
      );
    });

    await test.step('Filter - test column filter', async () => {
      // Navigate to processes page
      console.log('Navigating to processes page...');
      await page.goto(`${baseUrl}/processes`);

      // Go to "DONE" tab
      await switchToTab(page, 'DONE');

      // Click the filter button to open menu (use nth(3) since there are multiple)
      await page.getByTestId('filter-control-button-add-filters').nth(3).click();
      await page.waitForTimeout(1000);

      // Test column data
      const testColumnData = [
        {
          colId: 'invoice_currency',
          value: 'EUR',
          operation: 'equal',
        },
      ];

      await page.getByTestId(`filter-menu-item-${testColumnData[0].colId}`).nth(3).click();
      await page.waitForTimeout(1000);

      // Wait for filter input to appear and type the value
      const filterInput = page.locator('input[placeholder="type a value..."]').nth(3);

      // Wait for the input to be visible
      await filterInput.waitFor({ state: 'visible', timeout: 5000 });

      // Clear any existing value and type "EUR"
      await filterInput.clear();
      await filterInput.fill(testColumnData[0].value);

      // Verify the value was entered correctly
      const inputValue = await filterInput.inputValue();

      if (inputValue !== testColumnData[0].value) {
        throw new Error(`Expected input value to be "EUR" but got "${inputValue}"`);
      }

      // Apply the filter by clicking on the specific filter menu item
      await page.getByTestId(`filter-menu-item-${testColumnData[0].value}`).nth(3).click();

      // Wait for data to load using skeleton detection
      await waitForDataLoad(page, 3);

      // Validate all cells in the column contain the expected value
      await validateColumnValues(page, testColumnData[0].colId, testColumnData[0].value);

      // Clear filter
      await page.getByTestId('filter-control-button-clear-all-filters').nth(3).click();
      await page.waitForTimeout(1000);
      await page.getByTestId('clear-filters-confirmation-popup-yes').click();
    });

    await test.step('Display Options - test column order', async () => {
      // Go to "NEEDS_ATTENTION" tab
      await switchToTab(page, 'NEEDS_ATTENTION');

      // Open display options popup
      await page.getByTestId('display-options-icon').locator('button').first().click();
      await page.getByTestId('display-options-item-Columns').click();
      await page.waitForTimeout(1000);

      // Get initial order of columns
      const initialColumnOrder = await page.locator('[data-testid^="display-options-item-"]').all();
      const initialOrder = [];

      for (const column of initialColumnOrder) {
        const testId = await column.getAttribute('data-testid');

        if (testId) {
          initialOrder.push(testId);
        }
      }

      // Perform drag and drop operation using utility function
      await dragColumnAfter(page, 'invoice_currency', 'invoice_amount');

      // Click outside to close the display options popup
      await page.click('body', { position: { x: 500, y: 100 } });
      await page.getByTestId('display-options-icon').locator('button').first().click();
      await page.getByTestId('display-options-item-Columns').click();
      await page.waitForTimeout(1000);

      // Verify the new order
      const finalColumnOrder = await page.locator('[data-testid^="display-options-item-"]').all();
      const newOrder = [];

      for (const column of finalColumnOrder) {
        const testId = await column.getAttribute('data-testid');

        if (testId) {
          newOrder.push(testId);
        }
      }

      // Find positions of both columns in the new order
      const currencyIndex = newOrder.indexOf('display-options-item-invoice_currency');
      const amountIndex = newOrder.indexOf('display-options-item-invoice_amount');

      if (currencyIndex === -1 || amountIndex === -1) {
        throw new Error('Could not find one or both columns after drag operation');
      }

      // Verify that invoice_currency is now below invoice_amount
      if (currencyIndex <= amountIndex) {
        throw new Error(
          `Drag operation failed: invoice_currency (index ${currencyIndex}) should be below invoice_amount (index ${amountIndex})`,
        );
      }

      // Close the popup and verify table column order reflects the change
      await page.click('body', { position: { x: 500, y: 100 } });
      await page.waitForTimeout(1000);

      const tableHeaders = await page.locator('[data-testid^="tanstack-table-header-"]').all();
      const headerOrder = [];

      for (const header of tableHeaders) {
        const testId = await header.getAttribute('data-testid');

        if (testId) {
          headerOrder.push(testId);
        }
      }

      const headerCurrencyIndex = headerOrder.indexOf('tanstack-table-header-invoice_currency');
      const headerAmountIndex = headerOrder.indexOf('tanstack-table-header-invoice_amount');

      if (headerCurrencyIndex !== -1 && headerAmountIndex !== -1) {
        if (headerCurrencyIndex <= headerAmountIndex) {
          throw new Error(
            `Table headers do not reflect the drag change: invoice_currency (index ${headerCurrencyIndex}) should be after invoice_amount (index ${headerAmountIndex})`,
          );
        }
      }
    });

    await test.step('Display Options - test column visibility', async () => {
      // Go to "NEEDS_ATTENTION" tab
      await switchToTab(page, 'NEEDS_ATTENTION');

      // Open display options popup
      await page.getByTestId('display-options-icon').locator('button').first().click();
      await page.getByTestId('display-options-item-Columns').click();
      await page.waitForTimeout(1000);

      // Define columns to test
      const columnsToTest = ['display-options-item-invoice_currency', 'display-options-item-invoice_amount'];

      // Uncheck the specified columns using utility function
      await toggleColumns(page, columnsToTest, false);

      // Click outside to close the display options popup
      await page.click('body', { position: { x: 500, y: 100 } });

      // Wait for the display options popup to close
      await waitForCondition(
        async () => {
          const columnsTab = page.getByTestId('display-options-item-Columns');
          const isVisible = await columnsTab.isVisible().catch(() => false);

          return !isVisible; // Return true when it's no longer visible (closed)
        },
        {
          maxAttempts: 10,
          pollingInterval: 500,
          description: 'display options popup to close',
        },
      );

      // Check 1: Verify columns are hidden after unchecking
      const checkResults1 = await checkColumnsHidden(page, columnsToTest, 'after unchecking');

      // Validate results
      for (const result of checkResults1) {
        if (result.isPresent && result.shouldBeHidden) {
          throw new Error(`${result.columnId} is still present in table after unchecking`);
        }
      }

      // Check 2: Visit tab "IN_PROGRESS" and verify columns are still hidden
      await switchToTab(page, 'IN_PROGRESS', 2000);

      const checkResults2 = await checkColumnsHidden(page, columnsToTest, 'after tab change');

      for (const result of checkResults2) {
        if (result.isPresent && result.shouldBeHidden) {
          throw new Error(`${result.columnId} is still present in table after tab change`);
        }
      }

      // Check 3: Reload page and verify columns are still hidden
      await page.reload();
      await page.waitForTimeout(2000); // Wait for page to load

      const checkResults3 = await checkColumnsHidden(page, columnsToTest, 'after page reload');

      for (const result of checkResults3) {
        if (result.isPresent && result.shouldBeHidden) {
          throw new Error(`${result.columnId} is still present in table after page reload`);
        }
      }

      // Open display options popup
      await page.getByTestId('display-options-icon').locator('button').nth(2).click();
      await page.getByTestId('display-options-item-Columns').click();
      await page.waitForTimeout(1000);

      // Check back the unchecked columns using utility function
      await toggleColumns(page, columnsToTest, true);

      // Step 4: Check if columns are checked in display options popup
      for (const columnTestId of columnsToTest) {
        const columnOption = page.getByTestId(columnTestId);
        const isVisible = await columnOption.isVisible().catch(() => false);

        if (isVisible) {
          const checkbox = columnOption.locator('input[type="checkbox"], [role="checkbox"]');
          const isCurrentlyChecked = await checkbox.isChecked().catch(async () => {
            const checkedCount = await columnOption.locator('[aria-checked="true"]').count();

            return checkedCount > 0;
          });

          if (!isCurrentlyChecked) {
            throw new Error(`${columnTestId} should be checked but is unchecked`);
          }
        } else {
          throw new Error(`${columnTestId} is not found`);
        }
      }

      // Step 5: Click outside and check table headers for column presence
      await page.click('body', { position: { x: 500, y: 100 } });
      await waitForCondition(
        async () => {
          const columnsTab = page.getByTestId('display-options-item-Columns');
          const isVisible = await columnsTab.isVisible().catch(() => false);

          return !isVisible;
        },
        {
          maxAttempts: 10,
          pollingInterval: 500,
          description: 'display options popup to close',
        },
      );

      const checkResults4 = await checkColumnsHidden(page, columnsToTest, 'after re-checking columns');

      for (const result of checkResults4) {
        if (!result.isPresent) {
          throw new Error(`${result.columnId} should be visible but is missing from table headers`);
        }
      }

      // Step 6: Visit "IN_PROGRESS" tab and verify columns are present
      await switchToTab(page, 'IN_PROGRESS', 2000);

      const checkResults5 = await checkColumnsHidden(page, columnsToTest, 'after tab switch to IN_PROGRESS');

      for (const result of checkResults5) {
        if (!result.isPresent) {
          throw new Error(`${result.columnId} should be visible but is missing after switching to IN_PROGRESS tab`);
        }
      }

      // Step 7: Reload page and verify columns are still present
      await page.reload();
      await page.waitForTimeout(2000);

      const checkResults6 = await checkColumnsHidden(page, columnsToTest, 'after page reload with checked columns');

      for (const result of checkResults6) {
        if (!result.isPresent) {
          throw new Error(`${result.columnId} should be visible but is missing after page reload`);
        }
      }
    });
  });
});
