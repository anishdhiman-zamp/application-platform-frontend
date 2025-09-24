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
  // Click org switcher trigger
  await page.getByTestId('org-switcher-trigger').click();
  await page.waitForSelector('[data-state="open"]');

  // Wait for dropdown items to be fully loaded using the generic polling utility
  await waitForCondition(
    async () => {
      const orgItems = await page.locator('[data-testid*="org-switcher-item"]').all();

      if (orgItems.length > 0) {
        // Check if items have content (not empty)
        const itemsWithContent = await Promise.all(
          orgItems.map(async (item) => {
            const text = await item.textContent();

            return text && text.trim().length > 0;
          }),
        );

        if (itemsWithContent.some((hasContent) => hasContent)) {
          return true;
        }
      }

      return false;
    },
    {
      maxAttempts: 20,
      pollingInterval: 500,
      description: 'org-switcher dropdown to be visible',
    },
  );

  // Try to find the preferred org (without exact match to handle spacing issues)
  const preferredOrg = page.getByText(orgName);
  const isPreferredOrgVisible = await preferredOrg.isVisible().catch(() => false);

  if (isPreferredOrgVisible) {
    console.log(`Found and selecting: ${orgName}`);
    await preferredOrg.click();

    return orgName;
  } else {
    console.log(`${orgName} not found, falling back to Stripe`);

    await page.getByText('Stripe').click();

    return 'Stripe';
  }
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
