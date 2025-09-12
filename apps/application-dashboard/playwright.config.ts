import { defineConfig, ReporterDescription } from '@playwright/test';

const isCI = !!process.env.GITHUB_ACTIONS; // check if running in CI
const USE_LOCAL_SELENIUM_BROWSER = process.env.USE_LOCAL_SELENIUM === 'true'; // make this "!==" to run remote selenium-gird locally
const STORAGE_STATE = 'tests/session-secrets/session-state.json'; // browser session data

export const PLAYWRIGHT_ENV_CREDENTIALS = {
  googleSSOConfig: {
    adminEmail: 'admin@zamp.ai',
    adminPassword: 'Zamp@123Zamp@!@#',
    email: '', // use your google sso email
    password: '', // use your google sso password
    totpSecret: '', // generate your totp secret => https://zxing.org/w/decode.jspx
  },
  // Prefer env-provided CDP endpoint when launching local Selenium/Chrome with --remote-debugging-port
  localSeleniumBrowserCDPUrl: process.env.SELENIUM_CDP_URL || 'ws://localhost:9222',
  baseUrl: USE_LOCAL_SELENIUM_BROWSER ? 'https://local.zamp.ai:2000' : 'https://app-stg.zamp.ai', // run on stg = 'https://app-stg-aws.zamp.ai'
  isSeleniumLocalBrowser: USE_LOCAL_SELENIUM_BROWSER,
  storageState: STORAGE_STATE,
};

export default defineConfig({
  testDir: './tests',
  outputDir: './tests/test-results', // output dir for test results and artifacts
  fullyParallel: false, // disable parallel when using Selenium-Grid
  globalSetup: require.resolve('./tests/global-setup'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),
  forbidOnly: !!isCI,
  retries: isCI ? 2 : 0,
  workers: USE_LOCAL_SELENIUM_BROWSER ? 1 : isCI ? 2 : '100%', // single worker for Selenium-Grid
  timeout: 120 * 1000, // 2 minutes timeout for each test
  expect: {
    timeout: 120000, // 2 minutes timeout for expect assertions
  },
  reporter: [
    ['html', { open: 'never', outputFolder: './tests/playwright-report' }] as const,
    ['junit', { outputFile: './tests/test-results/junit.xml' }] as const,
    ['json', { outputFile: './tests/test-results/test-results.json' }] as const, // test results stored as json
    ['github'] as const,
    ['list'] as const,
    ...(isCI ? [['blob'] as const] : [['line'] as const]),
  ] as ReporterDescription[],

  use: {
    baseURL: PLAYWRIGHT_ENV_CREDENTIALS.baseUrl,
    trace: isCI ? 'on-first-retry' : 'on',
    storageState: isCI ? undefined : STORAGE_STATE,
    screenshot: 'only-on-failure' as const,
    video: {
      mode: 'on' as const, // Record videos for all tests
      size: { width: 1280, height: 720 },
    },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        storageState: STORAGE_STATE,
      },
    },
  ],
});
