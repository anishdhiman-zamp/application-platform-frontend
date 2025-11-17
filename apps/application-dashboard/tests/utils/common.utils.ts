/* eslint-disable absolute-imports/only-absolute-imports */
import type { Page } from '@playwright/test';

/**
 * Generic polling utility that waits for a condition to be met
 * @param conditionFn - Function that returns true when condition is met
 * @param options - Configuration options
 * @returns Promise<boolean> - true if condition was met, false if max attempts reached
 */
export async function waitForCondition(
  conditionFn: () => Promise<boolean>,
  options: {
    maxAttempts?: number;
    pollingInterval?: number;
    description?: string;
  } = {},
): Promise<boolean> {
  const {
    maxAttempts = 20, // Default 20 attempts
    pollingInterval = 500, // Default 500ms polling
    description = 'condition',
  } = options;

  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const conditionMet = await conditionFn();

      if (conditionMet) {
        return true;
      }
    } catch (error) {
      console.warn(`Error checking ${description}:`, error);
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, pollingInterval));
  }

  const totalTimeWaited = maxAttempts * pollingInterval;

  console.warn(`${description} not met after ${maxAttempts} attempts (${totalTimeWaited}ms), proceeding anyway...`);

  return false;
}

/**
 * Selects an organization from the org switcher with fallback to Stripe
 * @param page - The Playwright page object
 * @param orgName - The preferred organization name to select
 * @returns Promise<string> - The name of the organization that was actually selected
 */
export async function chooseOrganization(page: Page, orgName: string): Promise<string> {
  // Step 1: Poll until org-switcher-trigger is visible
  console.log('Polling for org-switcher-trigger to be visible...');
  let orgSwitcherVisible = false;
  let attempts = 0;

  while (!orgSwitcherVisible) {
    attempts++;
    try {
      const orgSwitcher = page.getByTestId('org-switcher-trigger');

      orgSwitcherVisible = await orgSwitcher.isVisible();

      if (orgSwitcherVisible) {
        console.log(`Org switcher trigger visible after ${attempts} attempts`);
        break;
      }
    } catch (error) {
      console.log(`Error checking org switcher trigger:`, error);
    }

    console.log(`Attempt ${attempts}: Org switcher trigger not visible yet, waiting 2 seconds...`);
    await page.waitForTimeout(2000);
  }

  // Step 2: Wait a bit for DOM to stabilize, then click org switcher to open dropdown
  await page.waitForTimeout(500);
  const orgSwitcher = page.getByTestId('org-switcher-trigger');

  // Wait for element to be stable and attached to DOM
  await orgSwitcher.waitFor({ state: 'attached', timeout: 5000 });

  try {
    await orgSwitcher.scrollIntoViewIfNeeded();
  } catch {
    console.log('[chooseOrganization] Could not scroll, element might already be in view');
  }

  console.log('[chooseOrganization] Clicking org switcher trigger...');

  // Force click to ensure it registers
  await orgSwitcher.click({ force: true });
  console.log('[chooseOrganization] Clicked org switcher trigger');

  // Verify the dropdown actually opened by checking data-state
  console.log('[chooseOrganization] Verifying dropdown opened...');
  let dropdownOpen = false;

  attempts = 0;

  while (!dropdownOpen) {
    attempts++;

    const dataState = await orgSwitcher.getAttribute('data-state');

    console.log(`> Attempt ${attempts}: data-state = "${dataState}"`);

    if (dataState === 'open') {
      dropdownOpen = true;
      console.log('> Dropdown opened successfully');
      break;
    }

    if (attempts >= 5) {
      console.log('> Dropdown not opening, trying again...');
      await orgSwitcher.click({ force: true });
    }

    await page.waitForTimeout(500);
  }

  // Step 3: Poll until organizations are loaded in the dropdown
  console.log('Polling for organizations to load in dropdown...');
  let availableOrgs: string[] = [];

  attempts = 0;

  while (availableOrgs.length === 0) {
    attempts++;

    const allOrgItems = await page.locator('[data-testid*="org-switcher-item-"]').all();
    const tempOrgs: string[] = [];

    for (const item of allOrgItems) {
      const testId = await item.getAttribute('data-testid');

      if (testId) {
        // Extract org name from testid: "org-switcher-item-stripe" → "stripe"
        const orgNameFromTestId = testId.replace('org-switcher-item-', '');

        tempOrgs.push(orgNameFromTestId);
      }
    }

    if (tempOrgs.length > 0) {
      availableOrgs = tempOrgs;
      console.log(`Found ${availableOrgs.length} organizations after ${attempts} attempts`);
      break;
    }

    if (attempts % 3 === 0) {
      console.log(`⏳ Attempt ${attempts}: No organizations loaded yet, waiting 2 seconds...`);
    }
    await page.waitForTimeout(2000);
  }

  console.log('Available organizations:', availableOrgs);

  // Step 5: Determine which org to select
  const normalizedOrgName = orgName.toLowerCase();
  const orgTestId = `org-switcher-item-${normalizedOrgName}`;

  let finalOrgTestId: string;
  let finalOrgName: string;

  if (availableOrgs.includes(normalizedOrgName)) {
    console.log(`Found requested org: "${orgName}"`);
    finalOrgTestId = orgTestId;
    finalOrgName = orgName;
  } else {
    console.log(`❌ Org "${orgName}" not found, falling back to "Stripe"`);
    finalOrgTestId = 'org-switcher-item-stripe';
    finalOrgName = 'Stripe';

    if (!availableOrgs.includes('stripe')) {
      console.log(`⚠️  "Stripe" also not found! Available orgs:`, availableOrgs);
      // Use the first available org as last resort
      if (availableOrgs.length > 0) {
        finalOrgTestId = `org-switcher-item-${availableOrgs[0]}`;
        finalOrgName = availableOrgs[0];
        console.log(`📌 Using first available org: "${finalOrgName}"`);
      } else {
        throw new Error('No organizations available in dropdown');
      }
    }
  }

  // Step 6: Get the org item and scroll it into view within the dropdown
  const orgItem = page.getByTestId(finalOrgTestId);

  console.log(`> Scrolling "${finalOrgName}" into view...`);

  // Scroll the item into view within the dropdown
  try {
    await orgItem.scrollIntoViewIfNeeded();
    console.log('> Org item scrolled into view');
  } catch (error) {
    console.log('> Could not scroll org item:', error);
  }

  // Wait a bit for scroll to complete
  await page.waitForTimeout(500);

  // Step 7: Click the org item
  console.log(`> Clicking org item: ${finalOrgName}`);
  await orgItem.click();
  console.log(`✅ Selected org: ${finalOrgName}`);

  return finalOrgName;
}

/**
 * Extracts process ID from the current URL
 * @param page - The Playwright page object
 * @param regex - Optional regex pattern to use for extraction
 * @returns Promise<string> - The extracted process ID
 * @throws Error if process ID cannot be extracted
 */
export async function extractProcessIdFromUrl(page: Page, regex?: string): Promise<string> {
  const currentUrl = page.url();

  console.log('Current URL:', currentUrl);

  // Use provided regex or default pattern
  const pattern = regex || /\/processes\/([^?]+)/;
  const processIdMatch = currentUrl.match(pattern);
  const processId = processIdMatch ? processIdMatch[1] : null;

  if (processId) {
    console.log('Process ID extracted:', processId);

    return processId;
  } else {
    console.log('No process ID found in URL');
    throw new Error('Process ID could not be extracted from URL');
  }
}
