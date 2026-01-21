/* eslint-disable absolute-imports/only-absolute-imports */
import { PLAYWRIGHT_ENV_CREDENTIALS } from '../../../playwright.config';
import { expect, test } from '../../session_management/cdp-test-setup';

// Configuration for the test
const teamMemberInviteConfig = {
  testUser: 'ram@zamp.ai', // Test email to invite and delete
  timeout: 120000, // 2 minutes timeout
};

test.describe('Invite New Member', () => {
  const { baseUrl } = PLAYWRIGHT_ENV_CREDENTIALS;
  const { testUser, timeout } = teamMemberInviteConfig;

  test('should be able to invite a new member', async ({ page }) => {
    test.setTimeout(timeout);

    // Step 1: Navigate to team page

    await test.step('Navigate to team page', async () => {
      console.log('Navigating to team page...');
      await page.goto(`${baseUrl}/people`);

      // Wait for page to be ready
      console.log('Waiting for invite button to be visible...');
      await page.waitForSelector('[data-testid="invite-user-btn"]', { state: 'visible', timeout: 15000 });
      console.log('Invite button is visible');
    });

    // Step 2: Open invite modal
    await test.step('Click invite button', async () => {
      const inviteBtn = page.getByTestId('invite-user-btn');

      // Ensure button is visible and ready
      await inviteBtn.waitFor({ state: 'visible', timeout: 10000 });

      // Scroll into view if needed
      await inviteBtn.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      console.log('Clicking invite button...');

      // Try clicking with retry logic
      const maxAttempts = 5;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`  Attempt ${attempt}/${maxAttempts} to click invite button...`);
          await inviteBtn.click({ timeout: 5000 });

          // Check if modal opened by waiting for email input
          const emailInput = page.getByRole('textbox', { name: 'Share with people and teams' });

          await emailInput.waitFor({ state: 'visible', timeout: 3000 });

          console.log('Invite modal opened successfully');
          break;
        } catch (error) {
          console.log(`  Attempt ${attempt} failed:`, (error as Error).message);
          if (attempt === maxAttempts) {
            throw new Error(`Invite modal did not open after ${attempt} click attempts`);
          }
          await page.waitForTimeout(1000);
        }
      }
    });

    // Step 3: Fill in email and send invite
    await test.step('Enter email and send invite', async () => {
      // Get the email input (already verified in previous step)
      const emailInput = page.getByRole('textbox', { name: 'Share with people and teams' });

      // Fill the email
      await emailInput.fill(testUser);

      // Press Enter to add the email to the list
      await emailInput.press('Enter');
      await page.waitForTimeout(1000);

      // Wait for the send button and click it
      const sendButton = page.getByRole('button', { name: 'Send invite' });

      // Wait for button to be enabled (not disabled)
      await sendButton.waitFor({ state: 'visible', timeout: 5000 });

      // Check if button is disabled
      const isDisabled = await sendButton.evaluate((button) => {
        return button.hasAttribute('disabled') || button.getAttribute('aria-disabled') === 'true';
      });

      if (isDisabled) {
        throw new Error('Send invite button is disabled - member might already be invited');
      }

      console.log('Clicking send button...');
      await sendButton.click();
      console.log('Send button clicked');

      // Wait for success toast
      await expect(page.getByText('Invitation mail sent')).toBeVisible({ timeout: 10000 });
    });

    // Step 4: Switch to Invited tab and verify
    await test.step('Switch to Invited tab', async () => {
      // Wait for modal to close
      await page.waitForTimeout(2000);

      // Click on Invited tab
      const invitedTab = page.getByTestId('tabs-v2-trigger-invited_members');

      await invitedTab.waitFor({ state: 'visible', timeout: 10000 });
      await invitedTab.click();
      console.log('Switched to Invited tab');

      // Wait for tab content to load
      await page.waitForTimeout(2000);
    });

    // Step 5: Find and delete the invited user
    await test.step('Delete invited user', async () => {
      console.log(`Looking for invited user: ${testUser}...`);

      // Find the row containing the test user email
      const row = page
        .locator('.group.relative.grid')
        .filter({ has: page.getByText(testUser) })
        .first();

      // Verify the row is visible
      await expect(row).toBeVisible({ timeout: 10000 });
      console.log('Found invited user row');

      // Hover over the row to reveal the delete button
      await row.hover();

      // Find and click the delete button (trash icon)
      const deleteBtn = row.locator('button:has([data-testid="svg-sprite-loader-trash-01"])').first();

      await expect(deleteBtn).toBeVisible({ timeout: 5000 });
      await deleteBtn.click();

      // Wait for deletion to complete
      await page.waitForTimeout(1000);

      // IMPORTANT: Check for success toast to confirm deletion
      console.log('Waiting for "Invitation deleted successfully" toast...');
      await expect(page.getByText('Invitation deleted successfully')).toBeVisible({ timeout: 10000 });

      // Final confirmation - only log success after toast appears
      console.log('✅ Invite Member test done');
    });
  });
});
