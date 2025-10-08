/* eslint-disable absolute-imports/only-absolute-imports */
import { formRequestUrlWithParams } from '@zamp-platform/utils';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { TOAST_MESSAGES } from '@/components/common/toast/toast.constants';
import { DEFAULT_PAGE_NAME, DEFAULT_SHEET_NAME } from '@/constants/common.constants';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import {
  CreatePageResponseType,
  CreateSheetFilterConfigResponseType,
  CreateSheetResponseType,
} from '@/types/api/pagesApi.types';
import { CreateWidgetResponseType } from '@/types/api/widgets.types';
import { REQUEST_TYPES } from '../../constants';
import { expect } from '../../session_management/cdp-test-setup';
import {
  getAddFilterBtnId,
  getAddSheetBtnId,
  getAgChartsWidgetsId,
  getDeleteFilterDialogBtnId,
  getDeleteFilterDialogDeleteBtnId,
  getDeletePageDialogBtnId,
  getDeleteSheetDialogBtnId,
  getDeleteWidgetDialogDeleteBtnId,
  getFilterControlContainerId,
  getFilterControlRemoveBtnId,
  getFiltersContainerId,
  getFiltersMenuV3ConfigureBtnId,
  getKpiTagId,
  getPageNavTabDeleteBtnId,
  getPageNavTabId,
  getPageNavTabInputId,
  getPageNavTabPopoverTriggerId,
  getSheetNameEditBtnId,
  getSheetNameInputId,
  getSheetTabDeleteBtnId,
  getSheetTabId,
  getSheetTabInputId,
  getSheetTabPopoverTriggerId,
  getWidgetOptionsDeleteBtnId,
  getWidgetOptionsHandleId,
  STANDARD_TIMEOUT,
  TEST_API_ENDPOINTS,
  TEST_IDS,
  waitForApiResponse,
} from './constants';
import type { ApiResponse, DeleteEntityConfig, EditNameConfig, FilterConfig, WidgetConfig } from './types';

// Generic API response handler
export const handleApiResponse = async <T>(
  responsePromise: Promise<any>,
  onSuccess?: (responseBody: T) => Promise<void> | void,
  onError?: (status: number) => Promise<void> | void,
): Promise<T | null> => {
  const response: ApiResponse = await responsePromise;

  if (response.ok()) {
    const responseBody = await response.json();

    if (onSuccess) {
      await onSuccess(responseBody);
    }

    return responseBody;
  } else {
    if (onError) {
      await onError(response.status());
    } else {
      throw new Error(`API request failed with status: ${response.status()}`);
    }

    return null;
  }
};

// Element interaction helpers
export const waitAndClick = async (page: any, testId: string, timeout = STANDARD_TIMEOUT) => {
  await page.waitForSelector(`[data-testid="${testId}"]`, { state: 'visible', timeout });
  await page.getByTestId(testId).click();
};

export const waitAndFill = async (page: any, testId: string, value: string, timeout = STANDARD_TIMEOUT) => {
  await page.waitForSelector(`[data-testid="${testId}"]`, { state: 'visible', timeout });
  await page.getByTestId(testId).fill(value);
};

export const waitAndSubmitForm = async (page: any, inputTestId: string, value: string, timeout = STANDARD_TIMEOUT) => {
  await waitAndFill(page, inputTestId, value, timeout);
  await page.getByTestId(inputTestId).press(KEYBOARD_KEYS.ENTER);
};

// Toast message verification helper
export const verifyToastMessage = async (page: any, message: string, timeout = STANDARD_TIMEOUT) => {
  await expect(page.getByText(message, { exact: true }).first()).toBeVisible({ timeout });
};

// Select dropdown option helper
export const selectDropdownOption = async (
  page: any,
  triggerTestId: string,
  optionName: string,
  timeout = STANDARD_TIMEOUT,
) => {
  await waitAndClick(page, triggerTestId, timeout);
  await page.getByRole('option', { name: optionName, exact: true }).click();
  await expect(page.getByTestId(triggerTestId)).toHaveAttribute('data-state', 'closed', { timeout });
};

// Drag and drop helper
export const performDragAndDrop = async (page: any, sourceTestId: string, targetTestId: string) => {
  const sourceElement = page.getByTestId(sourceTestId);
  const targetElement = page.getByTestId(targetTestId);

  await sourceElement.waitFor({ state: 'visible' });
  await targetElement.waitFor({ state: 'visible' });

  const sourceBounds = await sourceElement.boundingBox();
  const targetBounds = await targetElement.boundingBox();

  if (!sourceBounds || !targetBounds) {
    throw new Error('❌ Could not get element bounds for drag operation');
  }

  const sourceX = sourceBounds.x + sourceBounds.width / 2;
  const sourceY = sourceBounds.y + sourceBounds.height / 2;
  const targetX = targetBounds.x + targetBounds.width / 2;
  const targetY = targetBounds.y + targetBounds.height / 2;

  await page.mouse.move(sourceX, sourceY);
  await page.mouse.down();
  await page.mouse.move(targetX, targetY, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(1000);
};

// Verify position change after drag and drop
export const verifyPositionChange = async (
  page: any,
  element1TestId: string,
  element2TestId: string,
  initialBox1: any,
  initialBox2: any,
) => {
  const finalBox1 = await page.getByTestId(element1TestId).boundingBox();
  const finalBox2 = await page.getByTestId(element2TestId).boundingBox();

  if (!finalBox1 || !finalBox2) {
    throw new Error('❌ Could not get final positions after drag operation');
  }

  const element1PositionChanged =
    Math.abs(finalBox1.x - initialBox1.x) > 10 || Math.abs(finalBox1.y - initialBox1.y) > 10;

  const element2PositionChanged =
    Math.abs(finalBox2.x - initialBox2.x) > 10 || Math.abs(finalBox2.y - initialBox2.y) > 10;

  expect(element1PositionChanged).toBe(true);
  expect(element2PositionChanged).toBe(true);
};

// Widget creation helpers
export const configureBasicChart = async (
  page: any,
  title: string,
  dataset: string,
  xAxis: string,
  yAxis: string,
  groupBy?: string,
) => {
  await waitAndFill(page, TEST_IDS.WIDGET_TITLE_INPUT, title);
  await selectDropdownOption(page, TEST_IDS.DATASET_SELECT_TRIGGER, dataset);
  await selectDropdownOption(page, TEST_IDS.X_AXIS_SELECT_TRIGGER, xAxis);
  await selectDropdownOption(page, TEST_IDS.Y_AXIS_SELECT_TRIGGER, yAxis);

  if (groupBy) {
    await page.waitForTimeout(1000);
    await selectDropdownOption(page, TEST_IDS.GROUP_BY_SELECT_TRIGGER, groupBy);
    await waitAndClick(page, TEST_IDS.STACKING_SWITCH);
  }
};

export const configureKpiWidget = async (page: any, title: string, dataset: string) => {
  await waitAndFill(page, TEST_IDS.WIDGET_TITLE_INPUT, title);
  await selectDropdownOption(page, TEST_IDS.DATASET_SELECT_TRIGGER, dataset);

  await page.getByTestId(TEST_IDS.KPI_TAG_SELECT_TRIGGER).isVisible({ timeout: STANDARD_TIMEOUT });
  await page.getByTestId(TEST_IDS.KPI_TAG_SELECT_TRIGGER).click();
  await page.waitForTimeout(1000);

  const kpiOptions = page.locator('[role="option"]');
  const firstKpiOption = kpiOptions.first();

  if (await firstKpiOption.isVisible()) {
    await firstKpiOption.click();
  }

  await expect(page.getByTestId(TEST_IDS.KPI_TAG_SELECT_TRIGGER)).toHaveAttribute('data-state', 'closed', {
    timeout: STANDARD_TIMEOUT,
  });
};

export const createWidget = async (page: any, config: WidgetConfig): Promise<string> => {
  if (config.type === 'chart' && config.xAxis && config.yAxis) {
    await configureBasicChart(page, config.title, config.dataset, config.xAxis, config.yAxis, config.groupBy);
  } else if (config.type === 'kpi') {
    await configureKpiWidget(page, config.title, config.dataset);
  }

  await expect(page.getByTestId(TEST_IDS.WIDGET_DONE_BTN)).toBeEnabled({ timeout: STANDARD_TIMEOUT });
  const responsePromise = page.waitForResponse(TEST_API_ENDPOINTS.WIDGETS_INSTANCE);

  await page.getByTestId(TEST_IDS.WIDGET_DONE_BTN).click();

  const responseBody = await handleApiResponse<{ data: CreateWidgetResponseType }>(
    responsePromise,
    undefined,
    (status) => {
      throw new Error(`Failed to create widget. API returned status: ${status}`);
    },
  );

  if (!responseBody?.data?.widget_instance_id) {
    throw new Error('Widget creation failed: widget_instance_id is empty or undefined');
  }

  return responseBody.data.widget_instance_id;
};

// CRUD operation helpers
export const createPage = async (page: any, baseUrl: string): Promise<{ pageId: string; sheetId: string }> => {
  await waitAndClick(page, TEST_IDS.ADD_PAGE_BTN);

  const responsePromise = page.waitForResponse(TEST_API_ENDPOINTS.PAGES);
  const responseBody = await handleApiResponse<CreatePageResponseType>(responsePromise, undefined, (status) => {
    throw new Error(`Failed to add page. API returned status: ${status}`);
  });

  if (!responseBody) {
    throw new Error('Failed to create page');
  }

  const newPageId = responseBody.page.page_id;
  const newSheetId = responseBody.sheet.sheet_id;

  await expect(page).toHaveURL(`${baseUrl}/pages/${newPageId}/${newSheetId}`, { timeout: STANDARD_TIMEOUT });
  await expect(page.getByTestId(TEST_IDS.BREADCRUMB_EDIT_BTN)).toHaveText(DEFAULT_PAGE_NAME, {
    timeout: STANDARD_TIMEOUT,
  });
  await expect(page.getByTestId(getSheetTabId(newSheetId))).toBeVisible({ timeout: STANDARD_TIMEOUT });

  return { pageId: newPageId, sheetId: newSheetId };
};

export const createSheet = async (page: any, pageId: string, skipVisibilityTest?: boolean): Promise<string> => {
  const responsePromise = page.waitForResponse(TEST_API_ENDPOINTS.SHEET_CREATE_POST(pageId));

  await waitAndClick(page, getAddSheetBtnId(pageId));

  const responseBody = await handleApiResponse<CreateSheetResponseType>(
    responsePromise,
    async () => {
      await verifyToastMessage(page, TOAST_MESSAGES.SUCCESS_SHEET_CREATED);
    },
    async (status) => {
      await verifyToastMessage(page, TOAST_MESSAGES.ERROR_SHEET_CREATION_FAILED);
      throw new Error(`Failed to add sheet. API returned status: ${status}`);
    },
  );

  if (!responseBody) {
    throw new Error('Failed to create sheet');
  }

  const newSheetId = responseBody.sheet.sheet_id;

  if (!skipVisibilityTest) {
    await expect(page.getByTestId(getSheetTabId(newSheetId))).toBeVisible({ timeout: STANDARD_TIMEOUT });
    await expect(page.getByTestId(getSheetTabId(newSheetId))).toHaveText(DEFAULT_SHEET_NAME, {
      timeout: STANDARD_TIMEOUT,
    });
  }

  return newSheetId;
};

export const editName = async (page: any, config: EditNameConfig) => {
  let responsePromise: Promise<any>;
  let inputTestId: string;
  let successMessage: string;
  let errorMessage: string;

  if (config.type === 'page') {
    responsePromise = page.waitForResponse(TEST_API_ENDPOINTS.PAGE_UPDATE_BY_ID(config.id));
    successMessage = TOAST_MESSAGES.SUCCESS_PAGE_NAME_UPDATED;
    errorMessage = TOAST_MESSAGES.ERROR_PAGE_NAME_UPDATE;

    if (config.location === 'breadcrumb') {
      await waitAndClick(page, TEST_IDS.BREADCRUMB_EDIT_BTN);
      inputTestId = TEST_IDS.BREADCRUMB_EDIT_INPUT;
    } else {
      await page.getByTestId(getPageNavTabId(config.id)).hover();
      await waitAndClick(page, getPageNavTabPopoverTriggerId(config.id));
      inputTestId = getPageNavTabInputId(config.id);
    }
  } else {
    responsePromise = page.waitForResponse(TEST_API_ENDPOINTS.SHEET_UPDATE_BY_ID(config.pageId!, config.id));
    successMessage = TOAST_MESSAGES.SUCCESS_SHEET_NAME_UPDATED;
    errorMessage = TOAST_MESSAGES.ERROR_SHEET_NAME_UPDATE;

    if (config.location === 'header') {
      await waitAndClick(page, getSheetNameEditBtnId(config.id));
      inputTestId = getSheetNameInputId(config.id);
    } else {
      await page.getByTestId(getSheetTabId(config.id)).hover();
      await waitAndClick(page, getSheetTabPopoverTriggerId(config.id));
      inputTestId = getSheetTabInputId(config.id);
    }
  }

  await waitAndSubmitForm(page, inputTestId, config.newName);

  await handleApiResponse(
    responsePromise,
    async () => {
      await verifyToastMessage(page, successMessage);
    },
    async (status) => {
      await verifyToastMessage(page, errorMessage);
      throw new Error(`Failed to update ${config.type} name. API returned status: ${status}`);
    },
  );
};

export const deleteEntity = async (page: any, config: DeleteEntityConfig) => {
  let responsePromise: Promise<any>;

  if (config.type === 'widget') {
    await page.getByTestId(getAgChartsWidgetsId(config.id)).hover();
    await waitAndClick(page, getWidgetOptionsHandleId(config.id));
    await waitAndClick(page, getWidgetOptionsDeleteBtnId(config.id));
    await waitAndClick(page, getDeleteWidgetDialogDeleteBtnId(config.id));

    responsePromise = waitForApiResponse(
      page,
      formRequestUrlWithParams(API_ENDPOINTS.WIDGET_DELETE, { widgetId: config.id }),
      REQUEST_TYPES.DELETE,
    );
  } else if (config.type === 'sheet') {
    await page.getByTestId(getSheetTabId(config.id)).hover();
    await waitAndClick(page, getSheetTabPopoverTriggerId(config.id));
    await waitAndClick(page, getSheetTabDeleteBtnId(config.id));
    await waitAndClick(page, getDeleteSheetDialogBtnId(config.id));

    responsePromise = page.waitForResponse(TEST_API_ENDPOINTS.SHEET_DELETE_BY_PAGE_ID(config.pageId!, config.id));
  } else {
    await page.getByTestId(getPageNavTabId(config.id)).hover();
    await waitAndClick(page, getPageNavTabPopoverTriggerId(config.id));
    await waitAndClick(page, getPageNavTabDeleteBtnId(config.id));
    await waitAndClick(page, getDeletePageDialogBtnId(config.id));

    responsePromise = page.waitForResponse(TEST_API_ENDPOINTS.PAGE_BY_ID(config.id));
  }

  await handleApiResponse(responsePromise, undefined, (status) => {
    throw new Error(`Failed to delete ${config.type}. API returned status: ${status}`);
  });
};

// Filter management helpers
export const createFilter = async (
  page: any,
  pageId: string,
  sheetId: string,
  config: FilterConfig,
): Promise<string> => {
  await waitAndClick(page, TEST_IDS.CREATE_FILTER_BTN);
  await expect(page.getByTestId(TEST_IDS.CREATE_EDIT_FILTER_DIALOG)).toBeVisible({ timeout: STANDARD_TIMEOUT });

  // Select dataset
  await page.getByRole('option', { name: config.dataset, exact: true }).click();
  await expect(page.getByTestId(TEST_IDS.DATASET_SELECTOR_BTN)).toHaveAttribute('data-state', 'closed', {
    timeout: STANDARD_TIMEOUT,
  });

  // Select column
  await waitAndClick(page, TEST_IDS.SELECT_COLUMNS_BTN);
  await page.getByRole('option', { name: config.column, exact: true }).click();

  // Configure filter
  await waitAndClick(page, TEST_IDS.FILTER_OPERATOR_TRIGGER);
  await page.getByText(config.value, { exact: true }).click();

  // Submit filter
  await expect(page.getByTestId(TEST_IDS.FILTER_SUBMIT_BTN)).toBeEnabled({ timeout: STANDARD_TIMEOUT });
  const responsePromise = waitForApiResponse(page, `/pages/${pageId}/sheets/${sheetId}/filters`, REQUEST_TYPES.POST);

  await page.getByTestId(TEST_IDS.FILTER_SUBMIT_BTN).click();

  const responseBody = await handleApiResponse<CreateSheetFilterConfigResponseType>(
    responsePromise,
    undefined,
    (status) => {
      throw new Error(`Failed to create filter. API returned status: ${status}`);
    },
  );

  if (!responseBody) {
    throw new Error('Failed to create filter');
  }

  const filterId = responseBody.data.id;

  // Verify filter creation
  await expect(page.getByTestId(TEST_IDS.CREATE_EDIT_FILTER_DIALOG)).toBeHidden({ timeout: STANDARD_TIMEOUT });
  await expect(page.getByTestId(getFiltersContainerId(sheetId))).toBeVisible({ timeout: STANDARD_TIMEOUT });

  return filterId;
};

export const editFilter = async (page: any, filterId: string, newName: string) => {
  await page.getByTestId(getFilterControlContainerId(filterId)).click();
  await waitAndClick(page, TEST_IDS.CONFIGURE_FILTER_BUTTON);
  await expect(page.getByTestId(TEST_IDS.CREATE_EDIT_FILTER_DIALOG)).toBeVisible({ timeout: STANDARD_TIMEOUT });

  await waitAndClick(page, TEST_IDS.FILTER_NAME_BUTTON);
  await waitAndSubmitForm(page, TEST_IDS.FILTER_NAME_INPUT, newName);
  await expect(page.getByTestId(TEST_IDS.FILTER_NAME_INPUT)).toBeHidden({ timeout: STANDARD_TIMEOUT });

  await expect(page.getByTestId(TEST_IDS.FILTER_SUBMIT_BTN)).toBeEnabled({ timeout: STANDARD_TIMEOUT });
  await page.getByTestId(TEST_IDS.FILTER_SUBMIT_BTN).click();
  await expect(page.getByTestId(TEST_IDS.CREATE_EDIT_FILTER_DIALOG)).toBeHidden({ timeout: STANDARD_TIMEOUT });
};

export const removeAndReapplyFilter = async (page: any, filterId: string, sheetId: string) => {
  // Remove filter
  await waitAndClick(page, getFilterControlRemoveBtnId(filterId));

  // Reapply filter
  await waitAndClick(page, TEST_IDS.FILTERS_MENU_V3_BTN);
  await waitAndClick(page, getAddFilterBtnId(filterId));
  await expect(page.getByTestId(getFiltersContainerId(sheetId))).toBeVisible({ timeout: STANDARD_TIMEOUT });
  await expect(page.getByTestId(getFilterControlContainerId(filterId))).toBeVisible({ timeout: STANDARD_TIMEOUT });
};

export const deleteFilter = async (page: any, pageId: string, sheetId: string, filterId: string) => {
  const responsePromise = page.waitForResponse(
    TEST_API_ENDPOINTS.SHEET_FILTER_CONFIG_DELETE(pageId, sheetId, filterId),
  );

  await waitAndClick(page, TEST_IDS.FILTERS_MENU_V3_BTN);
  await waitAndClick(page, getFiltersMenuV3ConfigureBtnId(filterId));
  await expect(page.getByTestId(TEST_IDS.CREATE_EDIT_FILTER_DIALOG)).toBeVisible({ timeout: STANDARD_TIMEOUT });
  await waitAndClick(page, getDeleteFilterDialogBtnId(filterId));
  await waitAndClick(page, getDeleteFilterDialogDeleteBtnId(filterId));

  await handleApiResponse(
    responsePromise,
    async () => {
      await expect(page.getByTestId(TEST_IDS.CREATE_EDIT_FILTER_DIALOG)).toBeHidden({ timeout: STANDARD_TIMEOUT });
      await expect(page.getByTestId(TEST_IDS.CREATE_FILTER_BTN)).toBeVisible({ timeout: STANDARD_TIMEOUT });
    },
    (status) => {
      throw new Error(`Failed to delete filter. API returned status: ${status}`);
    },
  );
};

// Reorder helpers
export const reorderElements = async (page: any, sourceTestId: string, targetTestId: string, type: string) => {
  const initialBox1 = await page.getByTestId(sourceTestId).boundingBox();
  const initialBox2 = await page.getByTestId(targetTestId).boundingBox();

  if (!initialBox1 || !initialBox2) {
    throw new Error(`❌ Could not get initial ${type} positions`);
  }

  await performDragAndDrop(page, sourceTestId, targetTestId);
  await verifyPositionChange(page, sourceTestId, targetTestId, initialBox1, initialBox2);
};

export const reorderWidgets = async (
  page: any,
  widget1Id: string,
  widget2Id: string,
  widget1Type: 'kpi' | 'chart' = 'kpi',
) => {
  const widget1TestId = widget1Type === 'kpi' ? getKpiTagId(widget1Id) : getAgChartsWidgetsId(widget1Id);
  const widget2TestId = getAgChartsWidgetsId(widget2Id);
  const handleTestId = getWidgetOptionsHandleId(widget1Id);

  await page.getByTestId(widget1TestId).hover();
  await expect(page.getByTestId(handleTestId)).toBeVisible({ timeout: STANDARD_TIMEOUT });
  await expect(page.getByTestId(widget2TestId)).toBeVisible({ timeout: STANDARD_TIMEOUT });

  await page.getByTestId(handleTestId).dragTo(page.getByTestId(widget2TestId));
  await page.waitForTimeout(1000);
};
