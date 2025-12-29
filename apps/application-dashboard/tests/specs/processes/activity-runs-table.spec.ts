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
  timeout: 10 * 60 * 2000, // 20 minutes
};

test.describe('Activity-Runs Table and Filters Flow', () => {
  const { baseUrl } = PLAYWRIGHT_ENV_CREDENTIALS;
  const { timeout } = activityRunsTableConfig;

  test('should be able test filter and display options', async ({ page }) => {
    test.setTimeout(timeout);

    // Navigate to processes page
    console.log('Navigating to processes page...');
    await page.goto(`${baseUrl}/process`, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
      console.log('⚠️ Network idle timeout, continuing anyway...');
    });

    console.log('Page loaded, waiting for content to render...');
    await page.waitForTimeout(2000); // Give time for React to render

    await test.step('Open org switcher and select an available org', async () => {
      // select Org - chooseOrganization handles polling and will fallback to Stripe if Anonymous is not available
      await chooseOrganization(page, 'Anonymous');

      // Wait for page navigation to complete after org selection
      console.log('Waiting for page to load after org selection...');
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {
        console.log('DOM content loaded timeout, continuing...');
      });

      // Give time for data to load
      await page.waitForTimeout(3000);

      // Wait for activity runs status tabs to be visible after org switch
      console.log('Waiting for activity runs status tabs to be visible...');
      await waitForCondition(
        async () => {
          const statusTabs = page.getByTestId('activity-runs-status-tabs-group');

          return await statusTabs.isVisible();
        },
        {
          maxAttempts: 20,
          pollingInterval: 1000,
          description: 'activity runs status tabs to be visible',
        },
      );
      console.log('Activity runs status tabs are visible');
    });

    await test.step('Filter - test column filter', async () => {
      // We're already on the processes page from org selection
      console.log('Already on processes page, switching to DONE tab...');

      // Go to "DONE" tab
      await switchToTab(page, 'DONE');

      // Click the filter button for the DONE tab (using tab-specific test ID)
      await page.getByTestId('filter-control-button-add-filters-DONE').click();
      await page.waitForTimeout(1000);

      // Test column data
      const testColumnData = [
        {
          colId: 'invoice_currency',
          value: 'EUR',
          operation: 'equal',
        },
      ];

      // Select the filter column (filter menu items are in the dropdown, use last for now)
      await page.getByTestId(`filter-menu-item-${testColumnData[0].colId}`).last().click();
      await page.waitForTimeout(1000);

      // Wait for filter input to appear and type the value
      const filterInput = page.locator('input[placeholder="type a value..."]').last();

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

      // Apply the filter by clicking on the specific filter menu item - use last() for DONE tab
      await page.getByTestId(`filter-menu-item-${testColumnData[0].value}`).last().click();

      // Wait for data to load using skeleton detection - use last for DONE tab
      await waitForDataLoad(page, 'last');

      // Validate all cells in the column contain the expected value
      await validateColumnValues(page, testColumnData[0].colId, testColumnData[0].value);

      // Clear filter - use tab-specific test ID for DONE tab
      await page.getByTestId('filter-control-button-clear-all-filters-DONE').click();
      await page.waitForTimeout(1000);
      await page.getByTestId('clear-filters-confirmation-popup-yes').click();
    });

    await test.step('Display Options - test column order', async () => {
      // Go to "NEEDS_ATTENTION" tab
      await switchToTab(page, 'NEEDS_ATTENTION');

      // Wait for tab content to load
      console.log('Waiting for NEEDS_ATTENTION tab content to load...');
      await page.waitForTimeout(2000);

      // Open display options popup
      console.log('Opening display options for NEEDS_ATTENTION tab...');
      const displayOptionsButton = page.getByTestId('display-options-icon-NEEDS_ATTENTION').locator('button');

      // Wait for button to be visible
      await displayOptionsButton.waitFor({ state: 'visible', timeout: 10000 });
      console.log('Display options button is visible');

      // Click with retry
      const maxAttempts = 4;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`Clicking display options button (attempt ${attempt}/${maxAttempts})...`);
          await displayOptionsButton.click({ timeout: 5000 });
          console.log('Display options button clicked');
          break;
        } catch (error) {
          console.error(`Click failed (attempt ${attempt}):`, error);
          if (attempt === maxAttempts) throw error;
          await page.waitForTimeout(1000);
        }
      }

      await page.waitForTimeout(500);

      console.log('Clicking Columns item...');
      await page.getByTestId('display-options-item-Columns').click();
      console.log('Columns item clicked');
      await page.waitForTimeout(1000);

      // Wait for at least one column item to be visible
      console.log('Waiting for column options to load...');
      try {
        await page.locator('[data-testid^="display-options-item-"]').first().waitFor({
          state: 'visible',
          timeout: 10000,
        });
        console.log('Column options loaded');
      } catch {
        console.error('❌ Column options not loaded after 10s');
        throw new Error('Column options did not load');
      }

      // Get initial order of columns
      console.log('Getting initial column order...');
      const initialColumnOrder = await page.locator('[data-testid^="display-options-item-"]').all();

      console.log(`Found ${initialColumnOrder.length} column items`);

      const initialOrder = [];

      for (const column of initialColumnOrder) {
        const testId = await column.getAttribute('data-testid');

        if (testId) {
          initialOrder.push(testId);
        }
      }

      console.log('Initial column order:', initialOrder);

      // Perform drag and drop operation using utility function
      console.log('Starting drag operation: invoice_currency -> after invoice_amount...');
      await dragColumnAfter(page, 'invoice_currency', 'invoice_amount');
      console.log('Drag operation completed');

      // Click outside to close the display options popup
      await page.click('body', { position: { x: 500, y: 100 } });
      await page.getByTestId('display-options-icon-NEEDS_ATTENTION').locator('button').click();
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
      await page.getByTestId('display-options-icon-NEEDS_ATTENTION').locator('button').first().click();
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

      // After reload, we need to switch back to IN_PROGRESS tab
      console.log('Switching back to IN_PROGRESS tab after reload...');
      await switchToTab(page, 'IN_PROGRESS', 2000);

      const checkResults3 = await checkColumnsHidden(page, columnsToTest, 'after page reload');

      for (const result of checkResults3) {
        if (result.isPresent && result.shouldBeHidden) {
          throw new Error(`${result.columnId} is still present in table after page reload`);
        }
      }

      console.log('Column visibility persistence verified');

      // Open display options popup for IN_PROGRESS tab
      console.log('Opening display options for IN_PROGRESS tab...');
      const displayOptionsButton = page.getByTestId('display-options-icon-IN_PROGRESS').locator('button');

      // Wait for the button to be visible and clickable
      await displayOptionsButton.waitFor({ state: 'visible', timeout: 10000 });
      console.log('Display options button is visible');

      // Click with retry logic
      const maxAttempts = 4;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`Attempting to click display options button (attempt ${attempt}/${maxAttempts})...`);
          await displayOptionsButton.click({ timeout: 5000 });
          console.log('Display options button clicked');
          break;
        } catch (error) {
          console.error(`Failed to click (attempt ${attempt}):`, error);
          if (attempt === maxAttempts) throw error;
          await page.waitForTimeout(1000);
        }
      }

      // Wait for the popup menu to appear
      await page.waitForTimeout(500);

      // Click on Columns item
      console.log('Clicking on Columns item in display options...');
      await page.getByTestId('display-options-item-Columns').click();
      console.log('Columns item clicked');
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
      console.log('Reloading page to verify column persistence...');
      await page.reload({ waitUntil: 'domcontentloaded' });

      // Wait for page to be ready after reload
      await page.waitForTimeout(2000);

      // Poll until table headers are visible
      console.log('⏳ Waiting for table headers to be visible after reload...');
      let headersVisible = false;
      let visibilityAttempts = 0;
      const maxVisibilityAttempts = 20; // 20 attempts * 1 second = 20 seconds max

      while (!headersVisible && visibilityAttempts < maxVisibilityAttempts) {
        visibilityAttempts++;
        try {
          const headerLocator = page.locator('[data-testid^="tanstack-table-header-"]').first();

          headersVisible = await headerLocator.isVisible().catch(() => false);

          if (headersVisible) {
            console.log(`Table headers visible after ${visibilityAttempts} attempts`);
            break;
          }
        } catch {
          console.log(`⏳ Attempt ${visibilityAttempts}/${maxVisibilityAttempts}: Headers not visible yet...`);
        }

        await page.waitForTimeout(1000);
      }

      if (!headersVisible) {
        throw new Error(
          `Table headers not visible after ${maxVisibilityAttempts} attempts (${maxVisibilityAttempts} seconds)`,
        );
      }

      // Wait for table data to load
      await waitForDataLoad(page, 'last');

      // Poll until table headers exist (to get all headers)
      console.log('⏳ Waiting for all table headers to render after reload...');
      let headers: any[] = [];
      let attempts = 0;
      const maxHeaderAttempts = 15;

      while (headers.length === 0 && attempts < maxHeaderAttempts) {
        attempts++;
        headers = await page.locator('[data-testid^="tanstack-table-header-"]').all();

        if (headers.length > 0) {
          console.log(`Found ${headers.length} table headers after ${attempts} attempts`);
          break;
        }

        if (attempts % 5 === 0) {
          console.log(`⏳ Attempt ${attempts}: Still waiting for table headers to appear...`);
        }

        await page.waitForTimeout(200);
      }

      const checkResults6 = await checkColumnsHidden(page, columnsToTest, 'after page reload with checked columns');

      for (const result of checkResults6) {
        if (!result.isPresent) {
          throw new Error(`${result.columnId} should be visible but is missing after page reload`);
        }
      }

      // Final confirmation - only log success after all verifications pass
      console.log('✅ Activity runs table filter and display options test done');
    });
  });
});
