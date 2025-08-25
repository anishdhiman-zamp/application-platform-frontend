/**
 * @fileoverview
 * This file contains the functions to save, load, and clear the browser session data.
 * '.cdp-session.json' is a file created on demand which contains a key-value pair.
 * 'cdpUrl' and 'sessionId' => key-value pair
 * It is also used to clear the browser session data after the tests are done.
 */

import fs from 'fs';
import path from 'path';

const CDP_SESSION_FILE = path.resolve(__dirname, '.cdp-session.json');

export interface CDPSessionDataType {
  cdpUrl: string;
  sessionId: string;
}

export function saveCDPSession(data: CDPSessionDataType): void {
  try {
    fs.writeFileSync(CDP_SESSION_FILE, JSON.stringify(data, null, 2));
    console.log('Saved browser session data');
  } catch (error) {
    console.error('❌ Failed to save browser session:', error);
    throw error;
  }
}

export function loadCDPSession(): CDPSessionDataType | null {
  if (!fs.existsSync(CDP_SESSION_FILE)) {
    console.log('No existing browser session found');

    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(CDP_SESSION_FILE, 'utf-8'));

    if (data.cdpUrl && data.sessionId !== undefined) {
      console.log('🔍 Loaded existing browser session');

      return data as CDPSessionDataType;
    }
    console.warn('⚠️ Invalid session data format in CDP session file');

    return null;
  } catch (error) {
    console.error('❌ Error loading browser session:', error);

    return null;
  }
}

export function clearCDPSession(): void {
  if (fs.existsSync(CDP_SESSION_FILE)) {
    try {
      fs.unlinkSync(CDP_SESSION_FILE);
      console.log('🧹 Cleared browser session data');
    } catch (error) {
      console.error('❌ Failed to clear browser session:', error);
    }
  }
}
