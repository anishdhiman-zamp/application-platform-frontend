/* eslint-disable absolute-imports/only-absolute-imports */
import { PLAYWRIGHT_ENV_CREDENTIALS } from '../../../playwright.config';
import { expect, test } from '../../session_management/cdp-test-setup';
import { chooseOrganization, waitForCondition } from '../../utils/common.utils';
import { getPageNavTabId, STANDARD_TIMEOUT, TEST_IDS } from './constants';
import { createPage, deleteEntity, editName, reorderElements } from './utils';

export const { baseUrl, baseBEUrl } = PLAYWRIGHT_ENV_CREDENTIALS;

test.describe('Pages', () => {
  test('Pages', async ({ page }) => {
    let pageId = '';

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
    });

    await test.step('Edit page name from breadcrumb', async () => {
      await editName(page, {
        type: 'page',
        id: pageId,
        newName: 'Test Breadcrumb',
        location: 'breadcrumb',
      });

      await expect(page.getByTestId(getPageNavTabId(pageId))).toHaveText('Test Breadcrumb', {
        timeout: STANDARD_TIMEOUT,
      });
    });

    await test.step('Edit page name from sidebar', async () => {
      await editName(page, {
        type: 'page',
        id: pageId,
        newName: 'Test Sidebar',
        location: 'sidebar',
      });

      await expect(page.getByTestId(TEST_IDS.BREADCRUMB_EDIT_BTN)).toHaveText('Test Sidebar', {
        timeout: STANDARD_TIMEOUT,
      });
    });

    let newPageId = '';

    await test.step('Add a new page', async () => {
      const result = await createPage(page, baseUrl);

      newPageId = result.pageId;
    });

    await test.step('Re order pages', async () => {
      await reorderElements(page, getPageNavTabId(pageId), getPageNavTabId(newPageId), 'page');
    });

    await test.step('Delete page', async () => {
      await deleteEntity(page, {
        type: 'page',
        id: pageId,
      });
    });

    await test.step('Delete new page', async () => {
      await deleteEntity(page, {
        type: 'page',
        id: newPageId,
      });
    });

    console.log('✅ Pages test done');
  });
});
