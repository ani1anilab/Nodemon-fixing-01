<<<<<<< HEAD
// browser/browserManager.js
=======
// browser/browserManagerList.js
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

class BrowserManager {
  constructor() {
    this.browser = null;
    this.extensionPath = null;
  }

  useExtension(extensionPath) {
    this.extensionPath = extensionPath;
    return this;
  }

  async initialize() {
    // Create a user data directory for persistent context
    const userDataDir = path.join(process.cwd(), 'user-data-dir');
<<<<<<< HEAD

=======
    
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592
    // Ensure the directory exists
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }
<<<<<<< HEAD

=======
    
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592
    // Launch the browser with persistent context
    this.browser = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      ignoreDefaultArgs: ['--enable-automation'],
      args: [
        `--disable-extensions-except=${this.extensionPath}`,
        `--load-extension=${this.extensionPath}`,
        '--disable-blink-features=AutomationControlled',
        '--no-default-browser-check',
        '--no-first-run'
      ],
      extraHTTPHeaders: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
      }
    });

    // Modify the browser's userAgent to avoid detection
    await this.browser.addInitScript(() => {
      // Overwrite the automation-related properties
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
<<<<<<< HEAD

      // Remove the Chrome automation flag
      delete window.chrome.csi;
      delete window.chrome.loadTimes;

=======
      
      // Remove the Chrome automation flag
      delete window.chrome.csi;
      delete window.chrome.loadTimes;
      
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592
      // Modify the userAgent
      if (window.navigator.userAgent.includes('HeadlessChrome')) {
        const userAgent = window.navigator.userAgent
          .replace('HeadlessChrome', 'Chrome')
          .replace(/\s+\w+\/\d+\.\d+\.\d+\.\d+/, '');
<<<<<<< HEAD

=======
        
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592
        Object.defineProperty(navigator, 'userAgent', {
          get: () => userAgent
        });
      }
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async newPage() {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }
<<<<<<< HEAD

    // Create a new page
    const page = await this.browser.newPage();

=======
    
    // Create a new page
    const page = await this.browser.newPage();
    
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592
    // Close the default about:blank page if it's the first page
    if (this.browser.pages().length > 1) {
      const firstPage = this.browser.pages()[0];
      const url = await firstPage.url();
      if (url === 'about:blank' || url === '') {
        await firstPage.close();
      }
    }
<<<<<<< HEAD

=======
    
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592
    return page;
  }
}

export default BrowserManager;