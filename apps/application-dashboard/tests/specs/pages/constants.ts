/* eslint-disable absolute-imports/only-absolute-imports */
import type { Page } from '@playwright/test';
import { formRequestUrlWithParams } from '@zamp-platform/utils';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { PLAYWRIGHT_ENV_CREDENTIALS } from '../../../playwright.config';
import { REQUEST_TYPES } from '../../constants';

// Timeout constants
export const STANDARD_TIMEOUT = 10000;

// API constants
export const { baseUrl, baseBEUrl } = PLAYWRIGHT_ENV_CREDENTIALS;
export const TEST_API_ENDPOINTS = {
  PAGES: `${baseBEUrl}/${API_ENDPOINTS.PAGES_CREATE_POST}`,
  PAGES_GET: `${baseBEUrl}/${API_ENDPOINTS.PAGES_GET}`,
  WIDGETS_INSTANCE: `${baseBEUrl}/${API_ENDPOINTS.WIDGET_INSTANCE_POST}`,
  PAGE_BY_ID: (pageId: string) => `${baseBEUrl}/${formRequestUrlWithParams(API_ENDPOINTS.DELETE_PAGE, { pageId })}`,
  PAGE_SHEET_FILTERS: (pageId: string, sheetId: string) =>
    `${baseBEUrl}/${formRequestUrlWithParams(API_ENDPOINTS.PAGES_SHEETS_FILTER_CONFIG_POST, { pageId, sheetId })}`,
  PAGE_UPDATE_BY_ID: (pageId: string) =>
    `${baseBEUrl}/${formRequestUrlWithParams(API_ENDPOINTS.UPDATE_PAGE, { pageId })}`,
  SHEET_CREATE_POST: (pageId: string) =>
    `${baseBEUrl}/${formRequestUrlWithParams(API_ENDPOINTS.SHEET_CREATE_POST, { pageId })}`,
  SHEET_UPDATE_BY_ID: (pageId: string, sheetId: string) =>
    `${baseBEUrl}/${formRequestUrlWithParams(API_ENDPOINTS.UPDATE_SHEET_BY_PAGE_ID, { pageId, sheetId })}`,
  SHEET_DELETE_BY_PAGE_ID: (pageId: string, sheetId: string) =>
    `${baseBEUrl}/${formRequestUrlWithParams(API_ENDPOINTS.DELETE_SHEET_BY_PAGE_ID, { pageId, sheetId })}`,
  SHEET_FILTER_CONFIG_DELETE: (pageId: string, sheetId: string, filterId: string) =>
    `${baseBEUrl}/${formRequestUrlWithParams(API_ENDPOINTS.PAGES_SHEETS_FILTER_CONFIG_DELETE, { pageId, sheetId, filterId })}`,
  SHEET_FILTER_CONFIG_GET: (pageId: string, sheetId: string) =>
    `${baseBEUrl}/${formRequestUrlWithParams(API_ENDPOINTS.PAGES_SHEETS_FILTER_CONFIG_GET, { pageId, sheetId })}`,
} as const;

// Helper functions for API response matching
export const waitForApiResponse = (page: Page, urlPattern: string, method: REQUEST_TYPES) => {
  return page.waitForResponse(
    (response) => response.url().includes(urlPattern) && response.request().method() === method,
  );
};

// Test ID constants
export const TEST_IDS = {
  // Page management
  ADD_PAGE_BTN: 'add-page-btn',
  WIDGET_PLAYGROUND: 'widget-playground',
  BREADCRUMB_EDIT_BTN: 'breadcrumb-edit-btn',
  BREADCRUMB_EDIT_INPUT: 'breadcrumb-edit-input',
  TABS_OVERFLOW_MENU_TRIGGER: 'tabs-overflow-menu-trigger',

  // Widget creation form
  WIDGET_TITLE_INPUT: 'widget-creation-form-title-input',
  WIDGET_FULL_SIZE_SELECT_BTN: 'full-select-button',
  DATASET_SELECT_TRIGGER: 'widget-creation-form-dataset-select-trigger',
  WIDGET_DONE_BTN: 'widget-creation-form-done-btn',
  KPI_TAG_SELECT_TRIGGER: 'kpi-select-button',
  SELECT_BUTTON_SLIDER: 'select-button-slider',

  // Chart configuration
  X_AXIS_SELECT_TRIGGER: 'bar-line-chart-form-x-axis-select-trigger',
  Y_AXIS_SELECT_TRIGGER: 'bar-line-chart-form-y-axis-select-trigger',
  GROUP_BY_SELECT_TRIGGER: 'bar-line-chart-form-group-by-select-trigger',
  STACKING_SWITCH: 'bar-line-chart-form-stacking-switch',

  // Filter creation
  CREATE_FILTER_BTN: 'create-filter-btn',
  CREATE_EDIT_FILTER_DIALOG: 'create-edit-filter-discard-dialog',
  SELECT_COLUMNS_BTN: 'select-columns-btn',
  FILTER_OPERATOR_TRIGGER: 'filter-name-operator-options-trigger',
  FILTER_SUBMIT_BTN: 'create-edit-filter-submit-btn',
  DATASET_SELECTOR_BTN: 'dataset-selector-btn',
  FILTERS_MENU_V3_BTN: 'filters-menu-v3-btn',
  CONFIGURE_FILTER_BUTTON: 'configure-filter-button',
  FILTER_NAME_INPUT: 'filter-name-input',
  FILTER_NAME_BUTTON: 'filter-name-button',
} as const;

// Dynamic test ID generators
export const getEmptySheetAddWidgetBtnId = (sheetId: string) => `${sheetId}-empty-sheet-add-widget-btn`;
export const getSheetAddWidgetBtnId = (sheetId: string) => `${sheetId}-add-widget-btn`;
export const getPageNavTabId = (pageId: string) => `${pageId}-page-nav-tab`;
export const getPageNavTabPopoverTriggerId = (pageId: string) => `${pageId}-page-nav-tab-popover-trigger`;
export const getPageNavTabDeleteBtnId = (pageId: string) => `${pageId}-page-nav-tab-delete-page-btn`;
export const getDeletePageDialogBtnId = (pageId: string) => `${pageId}-delete-page-dialog-delete-btn`;
export const getFiltersContainerId = (sheetId: string) => `${sheetId}_FILTERS_CONTAINER`;
export const getPageNavTabInputId = (pageId: string) => `${pageId}-page-nav-tab-input`;
export const getSheetTabId = (sheetId: string) => `${sheetId}-sheet-tab`;
export const getEmptySheetImageId = (sheetId: string) => `${sheetId}-empty-sheet-image`;
export const getAddSheetBtnId = (pageId: string) => `${pageId}-add-sheet-btn`;
export const getSheetNameEditBtnId = (sheetId: string) => `${sheetId}-sheet-name-edit-btn`;
export const getSheetNameInputId = (sheetId: string) => `${sheetId}-sheet-name-input`;
export const getSheetTabPopoverTriggerId = (sheetId: string) => `${sheetId}-sheet-tab-popover-trigger`;
export const getSheetTabInputId = (sheetId: string) => `${sheetId}-sheet-tab-input`;
export const getSheetTabDeleteBtnId = (sheetId: string) => `${sheetId}-sheet-tab-delete-sheet-btn`;
export const getDeleteSheetDialogBtnId = (sheetId: string) => `${sheetId}-delete-sheet-dialog-delete-btn`;
export const getFilterControlRemoveBtnId = (filterId: string) => `${filterId}-filter-control-remove-btn`;
export const getFiltersMenuV3ConfigureBtnId = (filterId: string) => `${filterId}-filters-menu-v3-configure-btn`;
export const getDeleteFilterDialogBtnId = (filterId: string) => `${filterId}-delete-filter-btn`;
export const getDeleteFilterDialogDeleteBtnId = (filterId: string) => `${filterId}-delete-filter-dialog-delete-btn`;
export const getAddFilterBtnId = (filterId: string) => `${filterId}-add-filter-btn`;
export const getFilterControlContainerId = (filterId: string) => `${filterId}-filter-control-container`;
export const getAgChartsWidgetsId = (widgetId: string) => `${widgetId}-ag-charts-widgets`;
export const getWidgetOptionsHandleId = (widgetId: string) => `${widgetId}-widget-options-handle`;
export const getWidgetOptionsEditBtnId = (widgetId: string) => `${widgetId}-widget-options-edit-btn`;
export const getWidgetOptionsDeleteBtnId = (widgetId: string) => `${widgetId}-widget-options-delete-btn`;
export const getDeleteWidgetDialogDeleteBtnId = (widgetId: string) => `${widgetId}-delete-widget-dialog-delete-btn`;
export const getKpiTagId = (widgetId: string) => `${widgetId}-kpi-tag`;
