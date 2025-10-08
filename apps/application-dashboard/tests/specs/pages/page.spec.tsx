/* eslint-disable absolute-imports/only-absolute-imports */
import { PLAYWRIGHT_ENV_CREDENTIALS } from '../../../playwright.config';
import { expect, test } from '../../session_management/cdp-test-setup';
import { chooseOrganization, waitForCondition } from '../../utils/common.utils';
import {
  getAgChartsWidgetsId,
  getEmptySheetAddWidgetBtnId,
  getEmptySheetImageId,
  getFilterControlContainerId,
  getFilterControlRemoveBtnId,
  getFiltersContainerId,
  getPageNavTabId,
  getSheetAddWidgetBtnId,
  getSheetNameEditBtnId,
  getSheetTabId,
  getWidgetOptionsEditBtnId,
  getWidgetOptionsHandleId,
  STANDARD_TIMEOUT,
  TEST_IDS,
} from './constants';
import {
  createFilter,
  createPage,
  createSheet,
  createWidget,
  deleteEntity,
  deleteFilter,
  editFilter,
  editName,
  removeAndReapplyFilter,
  reorderElements,
  reorderWidgets,
  waitAndClick,
} from './utils';

let pageId = '',
  sheetId = '',
  widgetId = '';

export const { baseUrl, baseBEUrl } = PLAYWRIGHT_ENV_CREDENTIALS;

test.describe('All functionalities available for page, sheet, widget and sheet filters', () => {
  test.skip('Page, sheet, widget and sheet filters functionalities', async ({ page }) => {
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

    await test.step('Edit Widget', async () => {
      await page.getByTestId(getAgChartsWidgetsId(widgetId)).isVisible({ timeout: STANDARD_TIMEOUT });
      await page.getByTestId(getAgChartsWidgetsId(widgetId)).hover();
      await page.getByTestId(getWidgetOptionsHandleId(widgetId)).isVisible({ timeout: STANDARD_TIMEOUT });
      await page.getByTestId(getWidgetOptionsHandleId(widgetId)).click();
      await page.getByTestId(getWidgetOptionsEditBtnId(widgetId)).isVisible({ timeout: STANDARD_TIMEOUT });
      await page.getByTestId(getWidgetOptionsEditBtnId(widgetId)).click();
      await page.getByTestId(TEST_IDS.WIDGET_TITLE_INPUT).isVisible({ timeout: STANDARD_TIMEOUT });
      await expect(page.getByTestId(TEST_IDS.DATASET_SELECT_TRIGGER)).toHaveText('Recon Gold', {
        timeout: STANDARD_TIMEOUT,
      });
      await expect(page.getByTestId(TEST_IDS.X_AXIS_SELECT_TRIGGER)).toHaveText('Internal day', {
        timeout: STANDARD_TIMEOUT,
      });
      await expect(page.getByTestId(TEST_IDS.Y_AXIS_SELECT_TRIGGER)).toHaveText('Internal amount', {
        timeout: STANDARD_TIMEOUT,
      });
      await expect(page.getByTestId(TEST_IDS.GROUP_BY_SELECT_TRIGGER)).toHaveText('Country code', {
        timeout: STANDARD_TIMEOUT,
      });
      await page.getByTestId(TEST_IDS.WIDGET_TITLE_INPUT).fill('Test Edit Widget');
      await page.getByTestId(TEST_IDS.WIDGET_DONE_BTN).isVisible({ timeout: STANDARD_TIMEOUT });
      await page.getByTestId(TEST_IDS.WIDGET_DONE_BTN).isEnabled({ timeout: STANDARD_TIMEOUT });
      await page.getByTestId(TEST_IDS.WIDGET_DONE_BTN).click();
      await expect(page.getByText('Test Edit Widget', { exact: true })).toBeVisible({ timeout: STANDARD_TIMEOUT });
    });

    let kpiWidgetId = '';

    await test.step('Create KPI Widget', async () => {
      // Open Widget Playground
      await waitAndClick(page, getSheetAddWidgetBtnId(sheetId));
      await page.getByTestId(TEST_IDS.WIDGET_PLAYGROUND).isVisible({ timeout: STANDARD_TIMEOUT });

      // Create KPI widget
      kpiWidgetId = await createWidget(page, {
        type: 'kpi',
        title: 'Test widget KPI',
        dataset: 'Recon Gold',
      });

      // Verify widget creation
      await expect(page.getByTestId(TEST_IDS.WIDGET_PLAYGROUND)).toBeHidden({ timeout: STANDARD_TIMEOUT });
      await expect(page.getByText('Test widget KPI', { exact: true })).toBeVisible({ timeout: STANDARD_TIMEOUT });
    });

    await test.step('Re order widgets', async () => {
      await reorderWidgets(page, kpiWidgetId, widgetId, 'kpi');
    });

    await test.step('Resize Widget', async () => {
      const element = page.getByTestId(getAgChartsWidgetsId(widgetId));

      await element.isVisible({ timeout: STANDARD_TIMEOUT });

      const initialWidth = (await element.boundingBox())?.width;

      await element.hover();
      await expect(page.getByTestId(TEST_IDS.WIDGET_FULL_SIZE_SELECT_BTN)).toBeVisible({ timeout: STANDARD_TIMEOUT });
      await page.getByTestId(TEST_IDS.WIDGET_FULL_SIZE_SELECT_BTN).click();

      await page.waitForTimeout(2000);
      await element.hover();
      const sliderElement = page.getByTestId(TEST_IDS.SELECT_BUTTON_SLIDER);

      await expect(sliderElement).toBeVisible({ timeout: STANDARD_TIMEOUT });

      // Check if the slider has a positive translateX transform
      const transformStyle = await sliderElement.evaluate((el) => {
        return window.getComputedStyle(el).transform;
      });

      // Extract translateX value from matrix(scaleX, skewY, skewX, scaleY, translateX, translateY)
      const matrixMatch = transformStyle.match(/matrix\(([^)]+)\)/);

      if (matrixMatch) {
        const matrixValues = matrixMatch[1].split(',').map((v) => parseFloat(v.trim()));
        const translateX = matrixValues[4]; // translateX is the 5th parameter (index 4)

        expect(translateX).toBeGreaterThan(0);
      } else {
        // If not a matrix, it might be translateX directly
        const translateXMatch = transformStyle.match(/translateX\(([^)]+)\)/);

        if (translateXMatch) {
          const translateXValue = parseFloat(translateXMatch[1]);

          expect(translateXValue).toBeGreaterThan(0);
        } else {
          throw new Error(`Unexpected transform format: ${transformStyle}`);
        }
      }

      const newWidth = (await element.boundingBox())?.width;

      expect(newWidth).toBeGreaterThan(initialWidth!);
    });

    await test.step('Delete Widget', async () => {
      await deleteEntity(page, {
        type: 'widget',
        id: widgetId,
      });

      await expect(page.getByText('Test Edit Widget widget deleted successfully', { exact: true })).toBeVisible({
        timeout: STANDARD_TIMEOUT,
      });
      await expect(page.getByText('Test Edit Widget', { exact: true })).toBeHidden({ timeout: STANDARD_TIMEOUT });
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
        id: newSheetId,
        pageId: pageId,
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

    console.log('✅ page.spec.ts test done');
  });
});
