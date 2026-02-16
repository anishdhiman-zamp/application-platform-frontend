import { defineConfig, ReporterDescription } from '@playwright/test';

const isCI = !!process.env.GITHUB_ACTIONS; // check if running in CI
const USE_LOCAL_SELENIUM_BROWSER = process.env.USE_LOCAL_SELENIUM === 'true'; // make this "!==" to run remote selenium-gird locally
const STORAGE_STATE = 'tests/session-secrets/session-state.json'; // session data storage path

// configs
const GOOGLE_SSO_CONFIG = {
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  email: process.env.GOOGLE_SSO_EMAIL || '',
  password: process.env.GOOGLE_SSO_PASSWORD || '',
  totpSecret: process.env.GOOGLE_SSO_TOTP_SECRET || '',
};

const CODER_USERNAME = process.env.CODER_USERNAME || '';

const URL_CONFIG = {
  DEV: process.env.URL_DEV || '',
  STG: process.env.URL_STG || '',
  LOCAL_FE: CODER_USERNAME ? process.env.URL_CODER || '' : process.env.URL_LOCAL || '',
  LOCAL_BROWSER: process.env.URL_LOCAL_BROWSER_CDP || '',
  CODER_USERNAME: CODER_USERNAME,
};

const API_CONFIG = {
  DEV: process.env.API_DEV || '',
  STG: process.env.API_STG || '',
  CODER_LOCAL: CODER_USERNAME ? process.env.API_CODER || '' : '',
};

export const PLAYWRIGHT_ENV_CREDENTIALS = {
  googleSSOConfig: GOOGLE_SSO_CONFIG,
  urlConfig: URL_CONFIG,
  apiConfig: API_CONFIG,
  localSeleniumBrowserCDPUrl: process.env.SELENIUM_CDP_URL || URL_CONFIG.LOCAL_BROWSER,
  baseUrl: USE_LOCAL_SELENIUM_BROWSER ? URL_CONFIG.LOCAL_FE : URL_CONFIG.STG,
  isSeleniumLocalBrowser: USE_LOCAL_SELENIUM_BROWSER,
  storageState: STORAGE_STATE,
  baseBEUrl: USE_LOCAL_SELENIUM_BROWSER ? API_CONFIG.DEV : API_CONFIG.STG, // run on stg = 'https://api-stg.zamp.ai'
};

export default defineConfig({
  testDir: './tests', // test files directory
  outputDir: './tests/test-results', // output dir for test results and artifacts
  fullyParallel: false, // tests should run sequentially
  globalSetup: require.resolve('./tests/global-setup'), // global setup file
  globalTeardown: require.resolve('./tests/global-teardown.ts'), // global teardown file
  forbidOnly: !!isCI,
  retries: isCI ? 2 : 0,
  workers: 1, // single worker
  timeout: 300 * 1000, // 5 minutes timeout for each test
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
  // projects array is used to run tests on different browsers
  projects: [
    {
      name: 'chromium',
      use: {
        storageState: STORAGE_STATE,
      },
    },
  ],
});
