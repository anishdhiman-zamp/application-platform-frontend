/* eslint-disable absolute-imports/only-absolute-imports */
import type { Locator, Page } from '@playwright/test';
import { expect, test } from '../../session_management/cdp-test-setup';
import { waitForVisible } from '../../utils';

/**
 * #### Used to select an available organisation from the org switcher
 *
 * @param {Page} page - The Playwright page object
 * @param {string} baseUrl - The base URL of the application
 * @param {string} orgName - The name of the organisation to select
 *
 * @returns {Promise<void>}
 *
 * **/
export async function selectAvailableOrganisation(page: Page, baseUrl: string, orgName: string) {
  await waitForVisible(page.getByTestId('org-switcher-trigger'), 5000);
  await page.getByTestId('org-switcher-trigger').click();
  await page.waitForSelector('[data-state="open"]');

  await page
    .getByTestId(/^org-switcher-item-/)
    .first()
    .waitFor({ state: 'visible', timeout: 10000 });
  const orgs = await page.getByTestId(/^org-switcher-item-/).all();

  if (orgs.length === 0) {
    test.skip(true, 'No organisations available');
  }

  // Prefer Stripe if available, else select the first org
  const stripeOrg = await (async () => {
    for (const org of orgs) {
      const id = await org.getAttribute('data-testid');

      if (id?.includes(orgName)) return org;
    }

    return null;
  })();

  const selectedOrg = stripeOrg || orgs[0];

  await selectedOrg.click();
  await page.waitForURL(`${baseUrl}/**`, { timeout: 10000 });
}

/**
 * #### Used to select an available dataset from the datasets table
 *
 * @param {Page} page - The Playwright page object
 * @param {string} datasetName - The name of the dataset to select
 *
 * @returns {Promise<void>}
 *
 * **/
export async function selectAvailableDatasetDescription(page: Page, datasetName: string) {
  const datasetCells = await page.getByTestId(/^ag-cell:row-id=.*;colId=description$/).all();

  if (datasetCells.length === 0) {
    test.skip(true, 'No datasets available');
  }

  // Prefer dataset with description if available, else first dataset
  for (const cell of datasetCells) {
    const text = (await cell.innerText()).trim();

    if (text.includes(datasetName)) {
      await cell.scrollIntoViewIfNeeded();
      await cell.click();

      return;
    }
  }

  await datasetCells[0].scrollIntoViewIfNeeded();
  await datasetCells[0].click();
}

/**
 * Try to find the first visible `document_details` cell with non-empty content.
 * Scrolls through the grid viewport if necessary, similar to ensureAgCellVisible.
 *
 * @param {Page} page - The Playwright page object
 * @param {number} timeout - The timeout in milliseconds
 *
 * @returns {Promise<void>}
 */
export async function openDocumentDetailsIfPresent(page: Page, timeout = 10000) {
  const start = Date.now();
  let clickableCell: Locator | null = null;

  while (Date.now() - start < timeout) {
    const visibleDocCells = await page.getByTestId(/^ag-cell:row-id=.*;colId=document_details$/).all();

    for (const cell of visibleDocCells) {
      const text = (await cell.innerText()).trim();

      if (text) {
        clickableCell = cell;
        break;
      }
    }
    if (clickableCell) break;

    // Scroll viewport down to render more rows (similar to ensureAgCellVisible)
    await page.evaluate(() => {
      const viewport = document.querySelector('.ag-body-viewport') as HTMLElement | null;

      if (viewport) viewport.scrollTop += viewport.clientHeight / 2;
    });

    await page.waitForTimeout(200);
  }

  if (!clickableCell) {
    test.skip(true, 'No rows have document details to open');
  }

  await clickableCell!.click();

  const documentDetailsModal = page.getByRole('dialog');

  await documentDetailsModal.waitFor({ state: 'visible', timeout: 10000 });
  await expect(documentDetailsModal).toBeVisible();
}
