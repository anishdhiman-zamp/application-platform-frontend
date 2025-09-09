/* eslint-disable absolute-imports/only-absolute-imports */

/**
 * @fileoverview
 * This file contains the functions to get or create a CDP connection.
 * It is used to get or create a new CDP connection.
 * It is also used to close the CDP connection after the tests are done.
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { clearCDPSession, loadCDPSession, saveCDPSession } from './cdp-session-manager';
import { createSeleniumSession, deleteSeleniumSession } from './selenium-grid-connection';

export const STORAGE_STATE = path.join(__dirname, '..', 'session-secrets', 'session-state.json');

interface CDPConnectionType {
  cdpUrl: string;
  sessionId: string;
  storageState?: string;
}

export async function getOrCreateCDPConnection(): Promise<CDPConnectionType> {
  // Try to load existing session
  const existingSession = loadCDPSession();

  if (existingSession) {
    console.log('Reusing existing CDP session');

    return {
      cdpUrl: existingSession.cdpUrl,
      sessionId: existingSession.sessionId,
      storageState: fs.existsSync(STORAGE_STATE) ? STORAGE_STATE : undefined,
    };
  }

  // Create new session if none exists
  const { cdpUrl, sessionId } = await createSeleniumSession();

  console.log('Created new Selenium session');

  // Save the session data
  saveCDPSession({ cdpUrl, sessionId });

  return {
    cdpUrl,
    sessionId,
    storageState: fs.existsSync(STORAGE_STATE) ? STORAGE_STATE : undefined,
  };
}

export async function closeCDPConnection(): Promise<void> {
  try {
    const session = loadCDPSession();

    if (session) {
      // Close the browser connection if possible
      try {
        const browser = await chromium.connectOverCDP(session.cdpUrl);

        await browser.close();
      } catch (error) {
        console.warn('Could not close browser, it might be already closed:', error);
      }

      // Delete the session from Selenium Grid
      try {
        await deleteSeleniumSession(session.sessionId);
      } catch (error) {
        console.warn('Could not delete Selenium session, it might be already deleted:', error);
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    // Always clear the session data
    clearCDPSession();

    // Clean up storage state
    try {
      if (fs.existsSync(STORAGE_STATE)) {
        fs.unlinkSync(STORAGE_STATE);
      }
    } catch (error) {
      console.error('Error cleaning up storage state:', error);
    }
  }
}
