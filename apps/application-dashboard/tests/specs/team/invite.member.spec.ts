/* eslint-disable absolute-imports/only-absolute-imports */
import { PLAYWRIGHT_ENV_CREDENTIALS } from '../../../playwright.config';
import { expect, test } from '../../session_management/cdp-test-setup';

// Configuration for the test
const teamMemberInviteConfig = {
  testUser: 'ram@zamp.ai', // Replace with actual test email
  timeout: 1200000, // 20 minutes
};

test.describe('Invite New Member', () => {
  const { baseUrl } = PLAYWRIGHT_ENV_CREDENTIALS;
  const { testUser, timeout } = teamMemberInviteConfig;

  test('should be able to invite a new member', async ({ page }) => {
    // Navigate to team page
    console.log('Navigating to team page...');
    await page.goto(`${baseUrl}/team`);

    // Final check to ensure button is visible
    console.log('Waiting for invite button to be fully visible...');
    await page.waitForSelector('[data-testid="invite-user-btn"]', { state: 'visible' });

    // 1. Open invite modal
    await test.step('Open invite modal', async () => {
      console.log('Clicking invite button...');
      await page.getByTestId('invite-user-btn').click();
    });

    // 2. Fill in the email and send invite
    await test.step('Enter email and send invite', async () => {
      const emailInput = page.getByRole('textbox', { name: 'Share with people and teams' });

      await emailInput.fill(testUser);

      // Verify the send button state
      const sendButton = page.getByTestId('btn-send-user-invite');

      // Check both the disabled attribute and aria-disabled
      const isDisabled = await sendButton.evaluate((button) => {
        return button.hasAttribute('disabled') || button.getAttribute('aria-disabled') === 'true';
      });

      if (isDisabled) {
        throw new Error('Send invite button is disabled - member might already be invited');
      }
      await sendButton.click();
      await expect(page.getByText('Invitation mail sent')).toBeVisible({
        timeout,
      });
    });

    // 3. Verify in the invited section and delete if present
    await test.step('Verify invited-user appears in invited tab and delete it', async () => {
      await page.getByText('Invited', { exact: true }).click();

      // Rows are div-based; target by unique email within a row container
      const row = page
        .locator('.group.relative.grid')
        .filter({ has: page.getByText(testUser) })
        .first();

      await expect(row).toBeVisible({ timeout });

      // Hover to reveal the trash button and click it
      await row.hover();
      const deleteBtn = row.locator('button:has([data-testid="svg-sprite-loader-trash-01"])').first();

      await expect(deleteBtn).toBeVisible({ timeout: 5000 });
      await deleteBtn.click();

      // Confirm deletion if a dialog appears
      const confirmBtn = page.getByRole('button', { name: /delete|remove|confirm|yes/i }).first();

      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
      }

      // Verify user is no longer listed
      await expect(page.locator('.group.relative.grid').filter({ has: page.getByText(testUser) })).toHaveCount(0);
      console.log('✅ invite.member.spec.ts test done');
    });
  });
});
