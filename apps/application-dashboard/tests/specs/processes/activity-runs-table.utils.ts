/* eslint-disable absolute-imports/only-absolute-imports */

import { Page } from '@playwright/test';

interface ColumnCheckResult {
  columnId: string;
  expectedHeaderTestId: string;
  isPresent: boolean;
  shouldBeHidden: boolean;
}

// Helper function to check if columns are hidden
export async function checkColumnsHidden(page: Page, columnsToCheck: string[], testDescription = '') {
  // Get all actual header IDs present in the table
  const allHeaders = await page.locator('[data-testid^="tanstack-table-header-"]').all();
  const actualHeaderIds: string[] = [];

  for (const header of allHeaders) {
    const testId = await header.getAttribute('data-testid');

    if (testId) {
      actualHeaderIds.push(testId);
    }
  }

  // Get unique headers (after removing duplicates)
  const uniqueHeaderIds = [...new Set(actualHeaderIds)];

  console.log(`${testDescription} - Unique table headers ${uniqueHeaderIds?.length}:`, uniqueHeaderIds);

  // Store results for each column
  const columnCheckResults: ColumnCheckResult[] = [];

  for (const columnTestId of columnsToCheck) {
    // display-options-item-invoice_currency -> invoice_currency
    const columnId = columnTestId.replace('display-options-item-', '');

    // invoice_currency -> tanstack-table-header-invoice_currency
    const expectedHeaderTestId = `tanstack-table-header-${columnId}`;

    // Check if this header ID is in the unique headers list
    const isHeaderPresent = uniqueHeaderIds.includes(expectedHeaderTestId);

    columnCheckResults.push({
      columnId,
      expectedHeaderTestId,
      isPresent: isHeaderPresent,
      shouldBeHidden: true, // Assuming we're checking for hidden columns
    });
  }

  return columnCheckResults;
}

/**
 * Switches to a specific activity runs status tab
 * @param page - The Playwright page object
 * @param tabStatus - The status tab to switch to (e.g., 'DONE', 'IN_PROGRESS', 'NEEDS_ATTENTION')
 * @param waitTime - Time to wait after clicking the tab (default: 1000ms)
 */
export async function switchToTab(page: Page, tabStatus: string, waitTime = 1000): Promise<void> {
  await page.getByTestId(`activity-runs-status-tab-${tabStatus}`).click();
  await page.waitForTimeout(waitTime);
}

/**
 * Waits for skeleton loading cells to appear and disappear, indicating data load completion
 * @param page - The Playwright page object
 * @param skeletonIndex - Index of skeleton element to monitor (default: 0) or 'last' for the last skeleton
 * @param appearTimeout - Timeout for skeleton to appear (default: 5000ms)
 * @param disappearTimeout - Timeout for skeleton to disappear (default: 15000ms)
 */
export async function waitForDataLoad(
  page: Page,
  skeletonIndex: number | 'last' = 0,
  appearTimeout = 5000,
  disappearTimeout = 15000,
): Promise<void> {
  try {
    const skeletonLocator = page.locator('[data-testid="fetch-more-skeleton-cell"]');
    const targetSkeleton = skeletonIndex === 'last' ? skeletonLocator.last() : skeletonLocator.nth(skeletonIndex);

    // Wait for skeleton cells to appear (data is loading)
    await targetSkeleton.waitFor({
      state: 'visible',
      timeout: appearTimeout,
    });
    console.log(`Skeleton cells appeared (${skeletonIndex}), data is loading...`);

    // Wait for skeleton cells to disappear (data has loaded)
    await targetSkeleton.waitFor({
      state: 'hidden',
      timeout: disappearTimeout,
    });
    console.log(`Skeleton cells disappeared (${skeletonIndex}), data has loaded`);
  } catch (error) {
    console.log('No skeleton cells detected, using fallback wait...', error);
    // Fallback wait if no skeleton detected
    await page.waitForTimeout(2000);
  }
}

/**
 * Validates that all cells in a specific column contain the expected value
 * @param page - The Playwright page object
 * @param columnId - The column ID to validate (e.g., 'invoice_currency')
 * @param expectedValue - The expected value that all cells should contain
 */
export async function validateColumnValues(page: Page, columnId: string, expectedValue: string): Promise<void> {
  console.log(`Validating that all ${columnId} values match "${expectedValue}"...`);

  // Poll until cells are available (wait for API and rendering)
  console.log(`⏳ Waiting for ${columnId} cells to appear after data load...`);
  let cells: any[] = [];
  let attempts = 0;

  while (cells.length === 0) {
    attempts++;
    cells = await page.locator(`[data-testid="table-cell-${columnId}"]`).all();

    if (cells.length > 0) {
      console.log(`Found ${cells.length} ${columnId} cells after ${attempts} attempts`);
      break;
    }

    if (attempts % 5 === 0) {
      console.log(`⏳ Attempt ${attempts}: Still waiting for ${columnId} cells to appear...`);
    }

    await page.waitForTimeout(200);
  }

  // Check each cell value
  for (let i = 0; i < cells.length; i++) {
    const cellText = await cells[i].textContent();
    const cleanCellText = cellText?.trim();
    // console.log(`Cell ${i + 1}: "${cleanCellText}"`);

    if (cleanCellText !== expectedValue) {
      throw new Error(`Validation failed: Cell ${i + 1} contains "${cleanCellText}" but expected "${expectedValue}"`);
    }
  }

  console.log(`✅ All ${cells.length} ${columnId} cells validated successfully`);
}

/**
 * Toggles column visibility checkboxes in the display options
 * @param page - The Playwright page object
 * @param columnTestIds - Array of column test IDs to toggle (e.g., ['display-options-item-invoice_currency'])
 * @param shouldCheck - Whether to check (true) or uncheck (false) the columns
 */
export async function toggleColumns(page: Page, columnTestIds: string[], shouldCheck: boolean): Promise<void> {
  const action = shouldCheck ? 'Checking' : 'Unchecking';

  for (const columnTestId of columnTestIds) {
    const columnOption = page.getByTestId(columnTestId);
    const isVisible = await columnOption.isVisible().catch(() => false);

    if (isVisible) {
      // Check if the checkbox is currently checked
      const checkbox = columnOption.locator('input[type="checkbox"], [role="checkbox"]');
      const isCurrentlyChecked = await checkbox.isChecked().catch(async () => {
        // If no checkbox input, check for aria-checked attribute
        const checkedCount = await columnOption.locator('[aria-checked="true"]').count();

        return checkedCount > 0;
      });

      // Click if current state doesn't match desired state
      if (isCurrentlyChecked !== shouldCheck) {
        console.log(`${action} ${columnTestId}...`);
        await columnOption.click();
        await page.waitForTimeout(300);
      } else {
        console.log(`${columnTestId} already in desired state (${shouldCheck ? 'checked' : 'unchecked'})`);
      }
    } else {
      console.log(`Column ${columnTestId} not found - skipping`);
    }
  }
}

/**
 * Performs drag and drop operation to reorder columns in display options
 * @param page - The Playwright page object
 * @param sourceColumnId - The column ID to drag (e.g., 'invoice_currency')
 * @param targetColumnId - The column ID to drop after (e.g., 'invoice_amount')
 */
export async function dragColumnAfter(page: Page, sourceColumnId: string, targetColumnId: string): Promise<void> {
  // Find the source and target columns
  const sourceColumn = page.getByTestId(`display-options-item-${sourceColumnId}`);
  const targetColumn = page.getByTestId(`display-options-item-${targetColumnId}`);

  // Check if both columns exist
  const sourceExists = await sourceColumn.isVisible().catch(() => false);
  const targetExists = await targetColumn.isVisible().catch(() => false);

  if (!sourceExists) {
    throw new Error(`Source column ${sourceColumnId} not found`);
  }
  if (!targetExists) {
    throw new Error(`Target column ${targetColumnId} not found`);
  }

  // Get the drag handle for the source column
  const sourceDragHandle = sourceColumn.locator('.drag-handle').first();

  // Get the bounding box of both elements
  const sourceBox = await sourceColumn.boundingBox();
  const targetBox = await targetColumn.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error('Could not get bounding boxes for drag operation');
  }

  // Perform drag and drop operation
  await sourceDragHandle.hover();
  await page.mouse.down();

  // Calculate position below the target column
  const dropY = targetBox.y + targetBox.height; // below target
  const dropX = targetBox.x + targetBox.width / 2; // Center of target column

  await page.mouse.move(dropX, dropY, { steps: 10 });
  await page.waitForTimeout(500); // Allow for visual feedback
  await page.mouse.up();

  // Wait for the layout to update
  await page.waitForTimeout(1000);
}
