/* eslint-disable absolute-imports/only-absolute-imports */
import { PLAYWRIGHT_ENV_CREDENTIALS } from '../../../playwright.config';
import { expect, test } from '../../session_management/cdp-test-setup';
import { chooseOrganization, waitForCondition } from '../../utils/common.utils';
import { getEmptySheetImageId, getSheetNameEditBtnId, getSheetTabId, STANDARD_TIMEOUT, TEST_IDS } from './constants';
import { createPage, createSheet, deleteEntity, editName, reorderElements } from './utils';

export const { baseUrl, baseBEUrl } = PLAYWRIGHT_ENV_CREDENTIALS;

test.describe.skip('Sheets', () => {
  test('Sheets', async ({ page }) => {
    let pageId = '',
      sheetId = '';

    await test.step('Open org switcher and select an available org', async () => {
      await page.goto(`${baseUrl}/processes`);
      // select Org
      await chooseOrganization(page, 'Zamp');

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

    await test.step('Add a new page', async () => {
      const result = await createPage(page, baseUrl);

      pageId = result.pageId;
      sheetId = result.sheetId;
    });

    let newSheetId = '';

    await test.step('Add new sheet', async () => {
      newSheetId = await createSheet(page, pageId);

      await expect(page.getByTestId(getEmptySheetImageId(newSheetId))).toBeVisible({
        timeout: STANDARD_TIMEOUT,
      });
    });

    await test.step('Edit sheet name from header', async () => {
      await editName(page, {
        type: 'sheet',
        id: newSheetId,
        newName: 'Test Header',
        location: 'header',
        pageId: pageId,
      });

      await expect(page.getByTestId(getSheetTabId(newSheetId))).toHaveText('Test Header', {
        timeout: STANDARD_TIMEOUT,
      });
    });

    await test.step('Edit sheet name from tab', async () => {
      await editName(page, {
        type: 'sheet',
        id: newSheetId,
        newName: 'Test Tab',
        location: 'tab',
        pageId: pageId,
      });

      await expect(page.getByTestId(getSheetNameEditBtnId(newSheetId))).toHaveText('Test Tab', {
        timeout: STANDARD_TIMEOUT,
      });
      await expect(page.getByTestId(getSheetTabId(newSheetId))).toHaveText('Test Tab', {
        timeout: STANDARD_TIMEOUT,
      });
    });

    await test.step('Switch between sheets', async () => {
      await expect(page.getByTestId(getSheetTabId(sheetId))).toBeVisible({ timeout: STANDARD_TIMEOUT });
      await page.getByTestId(getSheetTabId(sheetId)).click();
      await expect(page).toHaveURL(`${baseUrl}/pages/${pageId}/${sheetId}`, { timeout: STANDARD_TIMEOUT });
    });

    await test.step('Re order sheets', async () => {
      await reorderElements(page, getSheetTabId(sheetId), getSheetTabId(newSheetId), 'sheet');
    });

    // Create additional sheets for testing tabs overflow and deletion
    let newSheetId3 = '';
    let newSheetId5 = '';

    await test.step('Add multiple sheets for tabs overflow test', async () => {
      await createSheet(page, pageId, true); // Sheet 2
      newSheetId3 = await createSheet(page, pageId, true); // Sheet 3
      await createSheet(page, pageId, true); // Sheet 4
      newSheetId5 = await createSheet(page, pageId, true); // Sheet 5
    });

    await test.step('Tabs overflow', async () => {
      await page.getByTestId(TEST_IDS.TABS_OVERFLOW_MENU_TRIGGER).click();
      await page.getByTestId(`${newSheetId5}-tabs-overflow-menu-item`).isVisible({ timeout: STANDARD_TIMEOUT });
      await page.getByTestId(`${newSheetId5}-tabs-overflow-menu-item`).click();
      await expect(page).toHaveURL(`${baseUrl}/pages/${pageId}/${newSheetId5}`, { timeout: STANDARD_TIMEOUT });
      await expect(page.getByTestId(getSheetTabId(newSheetId3))).toBeHidden({ timeout: STANDARD_TIMEOUT });
    });

    await test.step('Delete sheet', async () => {
      await deleteEntity(page, {
        type: 'sheet',
        id: sheetId,
        pageId: pageId,
      });
    });

    await test.step('Delete page', async () => {
      await deleteEntity(page, {
        type: 'page',
        id: pageId,
      });
    });

    console.log('✅ Sheets test done');
  });
});
