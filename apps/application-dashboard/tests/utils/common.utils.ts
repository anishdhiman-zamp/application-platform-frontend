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
  const maxInitialAttempts = 20; // 20 attempts * 2 seconds = 40 seconds max

  while (!orgSwitcherVisible && attempts < maxInitialAttempts) {
    attempts++;
    try {
      const orgSwitcher = page.getByTestId('org-switcher-trigger');

      orgSwitcherVisible = await orgSwitcher.isVisible();

      if (orgSwitcherVisible) {
        console.log(`Org switcher trigger visible after ${attempts} attempts`);
        break;
      }
    } catch (error) {
      console.log(`Error checking org switcher trigger (attempt ${attempts}/${maxInitialAttempts}):`, error);
    }

    console.log(
      `⏳ Attempt ${attempts}/${maxInitialAttempts}: Org switcher trigger not visible yet, waiting 2 seconds...`,
    );
    await page.waitForTimeout(2000);
  }

  if (!orgSwitcherVisible) {
    throw new Error(
      `Org switcher trigger not visible after ${maxInitialAttempts} attempts (${maxInitialAttempts * 2} seconds)`,
    );
  }

  // Step 2: Wait for DOM to stabilize and element to be fully ready
  console.log('[chooseOrganization] Waiting for org switcher to be ready...');
  await page.waitForTimeout(1000);

  const orgSwitcher = page.getByTestId('org-switcher-trigger');

  // Wait for element to be attached, visible, and stable
  await orgSwitcher.waitFor({ state: 'attached', timeout: 5000 });
  await orgSwitcher.waitFor({ state: 'visible', timeout: 5000 });

  // Wait for element to be stable (no animations)
  await page.waitForTimeout(500);

  try {
    await orgSwitcher.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
  } catch {
    console.log('[chooseOrganization] Could not scroll, element might already be in view');
  }

  console.log('[chooseOrganization] Clicking org switcher trigger...');

  // Try multiple methods to open the dropdown
  let dropdownOpen = false;

  attempts = 0;
  const maxAttempts = 10;

  while (!dropdownOpen && attempts < maxAttempts) {
    attempts++;

    try {
      console.log(`> Attempt ${attempts}/${maxAttempts}: Trying to click org switcher...`);

      // Try clicking with different methods
      if (attempts === 1) {
        console.log('  Method: regular click');
        await orgSwitcher.click({ timeout: 3000 });
      } else if (attempts === 2) {
        console.log('  Method: force click');
        await orgSwitcher.click({ force: true, timeout: 3000 });
      } else if (attempts === 3) {
        console.log('  Method: click with delay');
        await orgSwitcher.click({ delay: 100, timeout: 3000 });
      } else if (attempts === 4) {
        console.log('  Method: focus and Enter key');
        await orgSwitcher.focus();
        await page.keyboard.press('Enter');
      } else {
        console.log('  Method: force click (retry)');
        await orgSwitcher.click({ force: true, timeout: 3000 });
      }

      // Wait for animation/transition
      await page.waitForTimeout(1000);

      // Check if dropdown opened
      const dataState = await orgSwitcher.getAttribute('data-state');

      console.log(`  Result: data-state = "${dataState}"`);

      if (dataState === 'open') {
        dropdownOpen = true;
        console.log('Dropdown opened successfully!');
        break;
      } else {
        console.log(`Dropdown still closed, will retry...`);
      }
    } catch {
      console.log(`❌ Click failed`);
    }

    await page.waitForTimeout(500);
  }

  if (!dropdownOpen) {
    // Take screenshot for debugging
    await page.screenshot({
      path: 'tests/test-results/screenshots/org-switcher-failed-to-open.png',
      fullPage: true,
    });
    throw new Error(`Failed to open org switcher dropdown after ${maxAttempts} attempts`);
  }

  // Step 3: Poll until organizations are loaded in the dropdown
  console.log('Polling for organizations to load in dropdown...');
  let availableOrgs: string[] = [];

  attempts = 0;
  const maxOrgLoadAttempts = 15; // 15 attempts * 2 seconds = 30 seconds max

  while (availableOrgs.length === 0 && attempts < maxOrgLoadAttempts) {
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

    console.log(`⏳ Attempt ${attempts}/${maxOrgLoadAttempts}: No organizations loaded yet, waiting 2 seconds...`);
    await page.waitForTimeout(2000);
  }

  if (availableOrgs.length === 0) {
    throw new Error(
      `No organizations found in dropdown after ${maxOrgLoadAttempts} attempts (${maxOrgLoadAttempts * 2} seconds)`,
    );
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
    console.log(`Org "${orgName}" not found, falling back to "Stripe"`);
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
  console.log(`Selected org: ${finalOrgName}`);

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
