import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import { TOTP } from 'totp-generator';
import { PLAYWRIGHT_ENV_CREDENTIALS } from '../playwright.config';
import { getOrCreateCDPConnection } from '../tests/session_management/selenium-session-manager';
import { waitForVisible } from '../tests/utils';

// Authentication method enum
enum AuthMethod {
  EMAIL_PASSWORD = 'EMAIL_PASSWORD',
  GOOGLE_SSO = 'GOOGLE_SSO',
}

// Generate TOTP token using totp-generator package
function generateTOTP(secret: string): string {
  const { otp } = TOTP.generate(secret);

  return otp;
}

async function globalSetup(config: FullConfig) {
  const { storageState } = config.projects[0].use;
  const { adminEmail, adminPassword, email, password, totpSecret } = PLAYWRIGHT_ENV_CREDENTIALS.googleSSOConfig;
  const { baseUrl, isSeleniumLocalBrowser } = PLAYWRIGHT_ENV_CREDENTIALS;
  const redirectUrl = '/team';

  const { cdpUrl } = await getOrCreateCDPConnection();
  const browser = await chromium.connectOverCDP(cdpUrl);

  const page = await browser.newPage({
    ignoreHTTPSErrors: true,
  });

  console.log('Starting global authentication setup...');

  // Navigate to login page with redirect URL
  console.log(`Navigating to ${baseUrl}/login?redirect_to=${redirectUrl}`);
  await page.goto(`${baseUrl}/login?redirect_to=${redirectUrl}`);
  // Reload the page to ensure fresh state
  await page.reload({ waitUntil: 'networkidle' });

  // Helper function for 2FA
  async function handle2FA() {
    console.log('Handling 2FA if needed...');
    const chooseHowToSign = page.locator('text=Choose how you want to sign in');
    const tryAnotherWayBtn = page.getByRole('button', { name: /Try another way/i });
    const authCodeOption = page.getByText(/Get a verification code from the Google Authenticator app/i);

    const isChooseVisible = await waitForVisible(chooseHowToSign, 5000);

    if (isChooseVisible) {
      console.log('2FA method selection screen detected');
      await authCodeOption.waitFor({ timeout: 3000 });
      await authCodeOption.click();
    } else {
      const tryAnotherExists = await tryAnotherWayBtn.count().catch(() => 0);

      if (tryAnotherExists) {
        console.log('Trying another way for 2FA...');
        await tryAnotherWayBtn.click();
        await authCodeOption.waitFor({ timeout: 3000 });
        await authCodeOption.click();
      }
    }

    await page.waitForTimeout(1000);

    const otp = generateTOTP(totpSecret);

    await page.getByRole('textbox', { name: 'Enter code' }).fill(otp);
    await page.getByRole('button', { name: 'Next' }).click();
  }

  // Authentication method based on URL
  const isLocalhost = baseUrl.includes('local.zamp.ai');
  const authMethod: AuthMethod = isLocalhost ? AuthMethod.GOOGLE_SSO : AuthMethod.EMAIL_PASSWORD;

  // const authMethod = isSeleniumLocalBrowser ? AuthMethod.GOOGLE_SSO : AuthMethod.EMAIL_PASSWORD;

  switch (authMethod) {
    case AuthMethod.EMAIL_PASSWORD:
      console.log('Using email-password authentication...');
      await page.getByTestId('login-email').fill(adminEmail);
      await page.getByRole('button', { name: 'Login' }).click();

      // email-password auth
      await page.getByTestId('login-email').click();
      await page.getByTestId('login-email').fill(adminEmail);

      await page.getByTestId('login-password').click();
      await page.getByTestId('login-password').fill(adminPassword);

      await page.getByTestId('btn-login').click();
      break;

    case AuthMethod.GOOGLE_SSO:
      console.log('Using Google SSO authentication...');
      await page.getByTestId('login-email').fill(adminEmail);
      await page.getByRole('button', { name: 'Login' }).click();

      // Wait for redirect to Google Auth
      console.log('Waiting for Google Auth...');
      await page.waitForURL(/accounts\.google\.com/, { timeout: 15000 });

      // Google SSO user credentials
      console.log('Filling Google Auth credentials...');
      await page.getByRole('textbox', { name: 'Enter your email' }).fill(email);
      await page.getByRole('button', { name: 'Next' }).click();

      await page.getByRole('textbox', { name: 'Enter your password' }).fill(password);
      await page.getByRole('button', { name: 'Next' }).click();

      // 2FA handling
      await handle2FA();
      break;

    default:
      throw new Error(`Unknown authentication method: ${authMethod}`);
  }

  // 💡 Then confirm you see the dashboard element
  const peopleMenuItem = page.getByText('People', { exact: true });

  console.log('Waiting for redirect...');

  const maxWaitMs = 90_000;
  const pollInterval = 1000;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const currentURL = page.url();

    console.log(`🌐 Currently at: ${currentURL}`);
    if (
      currentURL.includes(
        isSeleniumLocalBrowser && !isLocalhost
          ? 'coder.dev-mum.internal.zamp.dev'
          : isSeleniumLocalBrowser
            ? 'app-dev.zamp.ai'
            : 'app-stg.zamp.ai',
      )
    ) {
      console.log(`Redirected to ${baseUrl}`);
      break;
    }
    await page.waitForTimeout(pollInterval);
  }

  console.log('Waiting for "People" menu to appear in sidebar...');
  try {
    await peopleMenuItem.waitFor({ timeout: 100000 }); // ⏳ wait up to 30s
    console.log('✅ global-setup.ts done');
  } catch {
    await page.screenshot({ path: 'tests/test-results/screenshots/global-setup-failure.png', fullPage: true });
    throw new Error('❌ "People" menu-item not visible, failed to reach dashboard.');
  }

  await page.context().storageState({ path: storageState as string });
  console.log('Auth session saved');
  if (!fs.existsSync(storageState as string)) {
    throw new Error('❌ Auth session is not saved');
  }
}

export default globalSetup;
