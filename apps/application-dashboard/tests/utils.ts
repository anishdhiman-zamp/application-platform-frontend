import type { Locator } from '@playwright/test';

export async function waitForVisible(locator: Locator, timeout = 5000, pollInterval = 250): Promise<boolean> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await locator.isVisible().catch(() => false)) return true;
    await locator.page().waitForTimeout(pollInterval);
  }

  return false;
}
