import BrowserManagerList from '../browser/browserManagerList.js';
import { getExtensionPathList } from '../browser/extensionsList.js';
import { scrollUntilEnd } from '../utils/scrollUtils.js';

// Create a browser manager instance
const browserManagerList = new BrowserManagerList();
browserManagerList.useExtension(getExtensionPathList('rektCaptcha-extension'));

// Use a promise lock to avoid race conditions during initialization
let browserInitializationPromise = null;

export async function initializeBrowser() {
  if (!browserManagerList.browser && !browserInitializationPromise) {
    browserInitializationPromise = browserManagerList.initialize();
  }
  await browserInitializationPromise;
}

export async function closeBrowser() {
  await browserManagerList.close();
}

export async function searchGoogleMaps(query, user_id, task_id, rating) {
  // Wait for the browser to be initialized (using our promise lock)
  if (!browserManagerList.browser) {
    await initializeBrowser();
  }

  const page = await browserManagerList.newPage();

  const refinedQuery = query.replace(/ /g, '+');

  try {
    await page.goto(`https://www.google.com/maps/search/${refinedQuery}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForSelector('.m6QErb.DxyBCb.kA9KIf.dS8AEf.XiKgde.ecceSd[aria-label]', {
      timeout: 60000
    });

    if (rating) {
      const ratingMapping = {
        '4.5+': '6',
        '4': '5',
        '3.5': '4',
        '3': '3',
        '2.5': '2',
        '2': '1'
      };

      if (rating in ratingMapping) {
        try {
          await page.click('div.Vo5ZAe div.KNfEk.siaXSd:nth-child(1) button.e2moi');
          await new Promise(resolve => setTimeout(resolve, 1000));
          await page.click(`.vij30.kA9KIf div[data-index="${ratingMapping[rating]}"]`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          console.error('Error applying rating filter:', error);
        }
      }
    }

    await scrollUntilEnd(page);

    // Instead of creating a CSV file, simply collect the links
    const linkElems = await page.$$('a.hfpxzc');
    const hrefs = await Promise.all(
      linkElems.map(async (elem) => await elem.getAttribute('href'))
    );

    // Close the page but keep the browser open
    await page.close();
    
    // Return the array of links directly
    return hrefs;
  } catch (error) {
    await page.close();
    throw error;
  }
}
