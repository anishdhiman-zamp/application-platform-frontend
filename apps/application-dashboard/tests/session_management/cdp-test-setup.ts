/* eslint-disable absolute-imports/only-absolute-imports */

/**
 * @fileoverview
 * This file is used to setup the CDP test environment.
 * It is used to create a new browser context and page.
 * Main purpose is to act as base-test setup for all the tests that use CDP instead of using Playwright's default test setup.
 */

import { chromium, test as baseTest } from '@playwright/test';
import { PLAYWRIGHT_ENV_CREDENTIALS } from '../../playwright.config';
import { closeCDPConnection, getOrCreateCDPConnection } from './selenium-session-manager';

// Export either Selenium Grid enhanced test or default Playwright test
export const test = baseTest.extend({
  browser: async ({ browserName }, use) => {
    console.log(`Connecting to ${browserName} Selenium Grid...`);
    const { cdpUrl } = await getOrCreateCDPConnection();

    console.log('Connected to Selenium Grid');

    const browser = await chromium.connectOverCDP(cdpUrl, {
      timeout: 60000,
      headers: { Connection: 'keep-alive' },
    });

    await use(browser);
  },

  context: async ({ browser }, use) => {
    console.log('Creating new context with storage state...');
    const context = await browser.newContext({
      storageState: PLAYWRIGHT_ENV_CREDENTIALS.storageState,
      ignoreHTTPSErrors: true,
    });

    // Set default localStorage values
    await context.addInitScript(() => {
      localStorage.setItem('ORG_REGION_V3', '');
      localStorage.setItem('ALL_REGIONS_V2', '["-us","-sg","-me"]');
    });

    await use(context);
  },

  page: async ({ context }, use) => {
    console.log('Creating new page...');
    const page = await context.newPage();

    await use(page);
  },
});

// Close connection when tests are done and we're using Selenium Grid
// Handle normal exit
process.on('beforeExit', async () => {
  await closeCDPConnection();
});

// Handle Ctrl+C and kill commands
process.on('SIGINT', async () => {
  await closeCDPConnection();
  process.exit(0);
});

// Handle Docker stop, system shutdown, etc.
process.on('SIGTERM', async () => {
  await closeCDPConnection();
  process.exit(0);
});

export { expect } from '@playwright/test';
