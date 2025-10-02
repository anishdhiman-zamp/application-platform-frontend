/* eslint-disable absolute-imports/only-absolute-imports */
import { PLAYWRIGHT_ENV_CREDENTIALS } from '../../../playwright.config';
import { expect, test } from '../../session_management/cdp-test-setup';
import { chooseOrganization, waitForCondition } from '../../utils/common.utils';
import {
  getAgChartsWidgetsId,
  getEmptySheetAddWidgetBtnId,
  getFilterControlContainerId,
  getFilterControlRemoveBtnId,
  getFiltersContainerId,
  STANDARD_TIMEOUT,
  TEST_IDS,
} from './constants';
import {
  createFilter,
  createPage,
  createWidget,
  deleteEntity,
  deleteFilter,
  editFilter,
  removeAndReapplyFilter,
  waitAndClick,
} from './utils';

export const { baseUrl, baseBEUrl } = PLAYWRIGHT_ENV_CREDENTIALS;

test.describe('Sheet filters', () => {
  test('Sheet filters', async ({ page }) => {
    let pageId = '',
      sheetId = '',
      widgetId = '';

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

    await test.step('Create Chart Widget', async () => {
      // Open Widget Playground
      await waitAndClick(page, getEmptySheetAddWidgetBtnId(sheetId));
      await page.waitForSelector(`[data-testid="${TEST_IDS.WIDGET_PLAYGROUND}"]`, { state: 'visible' });

      // Create chart widget
      widgetId = await createWidget(page, {
        type: 'chart',
        title: 'Test widget',
        dataset: 'Recon Gold',
        xAxis: 'Internal day',
        yAxis: 'Internal amount',
        groupBy: 'Country code',
      });

      // Verify widget creation
      await expect(page.getByTestId(TEST_IDS.WIDGET_PLAYGROUND)).toBeHidden({ timeout: STANDARD_TIMEOUT });
      await expect(page.getByTestId(getAgChartsWidgetsId(widgetId))).toBeVisible({ timeout: STANDARD_TIMEOUT });
      await expect(page.getByText('Test widget', { exact: true })).toBeVisible({ timeout: STANDARD_TIMEOUT });
    });

    let filterId = '';

    await test.step('Create and Verify Filter', async () => {
      filterId = await createFilter(page, pageId, sheetId, {
        dataset: 'Recon Gold',
        column: 'Currency code',
        operator: 'FILTER_OPERATOR_TRIGGER',
        value: 'AED',
      });

      await page.waitForTimeout(2000);
      await expect(page.getByTestId(getFiltersContainerId(sheetId))).toContainText('New Filter', {
        timeout: STANDARD_TIMEOUT,
      });
      await expect(page.getByTestId(getFiltersContainerId(sheetId))).toContainText('contains AED', {
        timeout: STANDARD_TIMEOUT,
      });
    });

    await test.step('Remove and reapply filter', async () => {
      await removeAndReapplyFilter(page, filterId, sheetId);
      await expect(page.getByTestId(getFilterControlContainerId(filterId))).toHaveClass(/shadow-chart-highlight/, {
        timeout: STANDARD_TIMEOUT,
      });
    });

    await test.step('Edit filter', async () => {
      await editFilter(page, filterId, 'Test Filter');
      await expect(page.getByTestId(getFiltersContainerId(sheetId))).toContainText('Test Filter', {
        timeout: STANDARD_TIMEOUT,
      });
    });

    await test.step('Remove Filter again', async () => {
      await waitAndClick(page, getFilterControlRemoveBtnId(filterId));
    });

    await test.step('Delete Filter', async () => {
      await deleteFilter(page, pageId, sheetId, filterId);
    });

    await test.step('Delete page', async () => {
      await deleteEntity(page, {
        type: 'page',
        id: pageId,
      });
    });

    console.log('✅ Sheet filters test done');
  });
});
