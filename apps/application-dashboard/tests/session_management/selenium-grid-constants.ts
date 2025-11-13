interface SeleniumGridConfigType {
  hubUrl: string;
  authorization: string;
  browserName: 'chrome' | 'firefox' | 'safari' | 'edge';
  cdpHost: string;
}

/*
 * Get default Selenium Grid configuration
 */
export function getDefaultSeleniumConfig(): SeleniumGridConfigType {
  return {
    hubUrl: 'https://zamp-stg-us-seleniumgrid.zamp.ai/wd/hub',
    authorization: process.env.SELENIUM_GRID_AUTH_TOKEN ?? '',
    browserName: 'chrome',
    cdpHost: 'zamp-stg-us-seleniumgrid.zamp.ai',
  };
}

/*
 * Get default Selenium Grid session payload
 */
export const SELENIUM_GRID_SESSION_PAYLOAD = {
  capabilities: {
    alwaysMatch: {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          '--disable-blink-features=AutomationControlled',
          '--window-size=1920,1080',
          '--force-device-scale-factor=1',
          '--disable-infobars',
          '--disable-notifications',
          '--no-sandbox',
          '--no-default-browser-check',
          '--no-first-run',
          '--hide-scrollbars',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process,TranslateUI',
          '--disable-blink-features',
          '--disable-extensions-except=',
          '--disable-component-extensions-with-background-pages',
          '--disable-default-apps',
          '--disable-breakpad',
          '--disable-component-update',
          '--disable-domain-reliability',
          '--disable-sync',
          '--disable-client-side-phishing-detection',
          '--disable-hang-monitor',
          '--disable-ipc-flooding-protection',
          '--disable-popup-blocking',
          '--disable-prompt-on-repost',
          '--metrics-recording-only',
          '--password-store=basic',
          '--use-mock-keychain',
          '--force-webrtc-ip-handling-policy=default_public_interface_only',
          '--force-fieldtrials=*BackgroundTracing/default/',
          '--disable-dev-shm-usage',
        ],
        excludeSwitches: ['enable-automation', 'enable-logging', 'disable-extensions', 'enable-blink-features'],
        prefs: {
          credentials_enable_service: false,
          'profile.password_manager_enabled': false,
          'plugins.always_open_pdf_externally': true,
          'profile.default_content_setting_values.geolocation': 1,
          'profile.default_content_setting_values.notifications': 1,
          'download.prompt_for_download': false,
          'download.directory_upgrade': true,
          'download.default_directory': '/tmp',
          'browser.set_download_behavior': 'allow',
          'safebrowsing.enabled': false,
          'webkit.webprefs.plugins_enabled': true,
          'profile.cookie_control_type': 0,
        },
      },
    },
  },
};
