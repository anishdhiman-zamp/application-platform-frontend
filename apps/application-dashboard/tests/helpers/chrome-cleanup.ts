import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function cleanupChromeDebug() {
  try {
    // Kill any Chrome instances using port 9222
    await execAsync('lsof -ti:9222 | xargs kill -9 2>/dev/null || true');

    // Clean up the temporary Chrome profile
    await execAsync('rm -rf /tmp/chrome-debug');

    console.log('Chrome debug instance cleaned up');
  } catch (error) {
    console.warn('⚠️ Chrome cleanup error:', error);
  }
}
