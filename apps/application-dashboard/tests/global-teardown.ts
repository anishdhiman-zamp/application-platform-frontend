import { cleanupChromeDebug } from '../tests/helpers/chrome-cleanup';
import { clearCDPSession, loadCDPSession } from '../tests/session_management/cdp-session-manager';
import { deleteSeleniumSession } from '../tests/session_management/selenium-grid-connection';

export default async function globalTeardown() {
  console.log('🧹 Running global teardown...');

  try {
    // Clean up the CDP session
    const session = loadCDPSession();

    if (session) {
      console.log(`🧹 Cleaning up Selenium session: ${session.sessionId}`);
      try {
        await deleteSeleniumSession(session.sessionId);
      } catch {
        console.warn('⚠️ Could not delete Selenium session (it might be already closed)');
      }
    }

    // Clear the session data (.cdp-session.json) file
    clearCDPSession();

    // Clean up Chrome debug instance
    await cleanupChromeDebug();

    console.log('Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
  }
}
