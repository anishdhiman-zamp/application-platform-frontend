/* eslint-disable absolute-imports/only-absolute-imports */

/**
 * @fileoverview
 * This file contains the functions to create and delete a Selenium session.
 * It is used to create a new Selenium session and get the CDP WebSocket URL and session ID.
 * It is also used to delete the Selenium session after the tests are done.
 */

import { PLAYWRIGHT_ENV_CREDENTIALS } from '../../playwright.config';
import { getDefaultSeleniumConfig, SELENIUM_GRID_SESSION_PAYLOAD } from './selenium-grid-constants';
export interface SeleniumSessionResponse {
  cdpUrl: string;
  sessionId: string;
}

/**
 * Create a new Selenium session and get the CDP WebSocket URL and session ID
 */
export async function createSeleniumSession(): Promise<SeleniumSessionResponse> {
  const { hubUrl, authorization, cdpHost } = getDefaultSeleniumConfig();
  const { localSeleniumBrowserCDPUrl, isSeleniumLocalBrowser } = PLAYWRIGHT_ENV_CREDENTIALS;

  if (isSeleniumLocalBrowser) {
    console.log('Using local Selenium browser with CDP URL:', localSeleniumBrowserCDPUrl);
    if (!localSeleniumBrowserCDPUrl) {
      throw new Error(`Invalid CDP URL: ${localSeleniumBrowserCDPUrl}`);
    }

    return {
      cdpUrl: localSeleniumBrowserCDPUrl,
      sessionId: '',
    };
  }

  const sessionPayload = SELENIUM_GRID_SESSION_PAYLOAD;

  try {
    const response = await fetch(`${hubUrl}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
      },
      body: JSON.stringify(sessionPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`Failed to create Selenium session: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const sessionData = await response.json();

    if (!sessionData.value?.capabilities?.['se:cdp']) {
      throw new Error('Selenium Grid did not return a CDP endpoint. Make sure CDP is enabled on the grid.');
    }

    const sessionId = sessionData.value.sessionId;
    const modifiedCdpUrl = `wss://${cdpHost}/session/${sessionId}/se/cdp`;

    return {
      cdpUrl: modifiedCdpUrl,
      sessionId,
    };
  } catch (error) {
    console.error('❌ Failed to create Selenium session:', error);
    throw error;
  }
}

export async function deleteSeleniumSession(sessionId: string): Promise<void> {
  const { hubUrl, authorization } = getDefaultSeleniumConfig();

  try {
    await fetch(`${hubUrl}/session/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
      },
    });

    console.log(`Selenium session ${sessionId} deleted successfully.`);
  } catch (error) {
    console.error(`❌ Failed to delete Selenium session ${sessionId}:`, error);
    throw error;
  }
}
