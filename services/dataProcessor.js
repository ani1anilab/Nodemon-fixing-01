import BrowserManager from '../browser/browserManager.js';
import { Semaphore } from '../utils/concurrency.js';
import { getExtensionPath } from '../browser/extensions.js';
import { scrollUntilImagesStop } from '../utils/scrollUtils.js';
import { getLocationFromAddress } from '../utils/areaUtils.js';

const browserManager = new BrowserManager();
browserManager.useExtension(getExtensionPath('rektCaptcha-extension'));

export async function initializeBrowser() {
<<<<<<< HEAD
  if (!browserManager.browser) {
    await browserManager.initialize();
  }
=======
  await browserManager.initialize();
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592
}

export async function closeBrowser() {
  await browserManager.close();
}

<<<<<<< HEAD
/**
 * Splits an array into batches of a given size.
 */
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Retry navigation with exponential backoff.
 */
async function navigateWithRetry(page, url, options = {}, maxRetries = 3) {
  let attempt = 0;
  let delay = 1000;
  while (attempt < maxRetries) {
    try {
      await page.goto(url, options);
      return; // Success
    } catch (error) {
      attempt++;
      console.warn(`navigateWithRetry: Attempt ${attempt} failed for ${url}: ${error.message}`);
      if (attempt >= maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
=======
export async function processBusinessLinks(links, fields) {
  // Ensure the browser is initialized.
  if (!browserManager.browser) {
    await initializeBrowser();
  }

  // Use a semaphore with a concurrency of 5.
  const semaphore = new Semaphore(5);
  const results = [];

  // Stagger delay of 500ms between launching pages.
  const delayMs = 1500;

  const processWithSemaphore = async (link, isRetry = false) => {
    // Stagger requests with a delay.
    await new Promise(resolve => setTimeout(resolve, delayMs));
    await semaphore.acquire();
    const page = await browserManager.newPage();

    try {
      const result = await processSingleLink(page, link, fields);
      results.push(result);
    } catch (error) {
      console.error(`Error processing link ${link}:`, error.message);
      results.push(createEmptyResult(fields));
    } finally {
      await page.close();
      semaphore.release();
    }
  };

  await Promise.all(links.map(link => processWithSemaphore(link)));
  return results;
}

function createEmptyResult(fields) {
  return Object.fromEntries(fields.map(field => [field, '']));
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592
}

async function processSingleLink(page, link, fields, singleImage = true) {
  const data = Object.fromEntries(fields.map(field => [field, '']));
  try {
<<<<<<< HEAD
    // Use retry logic for navigation
    await navigateWithRetry(page, link, { waitUntil: 'domcontentloaded', timeout: 60000 });
=======
    // Navigate to the link with a timeout.
    await page.goto(link, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for the main title element.
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592
    await page.waitForSelector('h1.DUwDvf', { timeout: 60000 });

    if (fields.includes('title')) {
      const titleElem = await page.$('h1.DUwDvf');
      if (titleElem) {
        data.title = (await titleElem.innerText()).trim();
      }
    }

    if (fields.includes('avg_rating')) {
      try {
        const avgRatingElem = await page.$('.F7nice span[aria-hidden="true"]');
        if (avgRatingElem) {
          data.avg_rating = (await avgRatingElem.innerText()).trim();
        }
      } catch (error) {
        console.error('Error extracting avg_rating:', error);
      }
    }

    if (fields.includes('rating_count')) {
      try {
        const ratingCountElem = await page.$('.F7nice span[aria-label]:nth-child(1)');
        if (ratingCountElem) {
          const ratingText = (await ratingCountElem.innerText()).trim();
          data.rating_count = ratingText.replace(/\D/g, '');
        }
      } catch (error) {
        console.error('Error extracting rating_count:', error);
      }
    }

    if (fields.includes('address')) {
      const addressElem = await page.$("button[data-item-id='address'] .AeaXub .rogA2c .Io6YTe");
      if (addressElem) {
        const address = (await addressElem.innerText()).trim();
        data.address = address;
<<<<<<< HEAD
=======
        // Optionally get city/area from address.
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592
        const { city, area } = await getLocationFromAddress(address);
        if (fields.includes('city')) data.city = city;
        if (fields.includes('area')) data.area = area;
      }
    }

    if (fields.includes('website')) {
      const websiteElem = await page.$("a[data-item-id='authority'] .AeaXub .rogA2c .Io6YTe");
      if (websiteElem) {
        data.website = (await websiteElem.innerText()).trim();
      }
    }

    if (fields.includes('phone')) {
      const phoneElem = await page.$("button[data-tooltip='Copy phone number'] .AeaXub .rogA2c .Io6YTe");
      if (phoneElem) {
        data.phone = (await phoneElem.innerText()).trim();
      }
    }

<<<<<<< HEAD
    if (fields.includes('category')) {
      const categoryElem = await page.$("button.DkEaL");
      if (categoryElem) {
        data.category = (await categoryElem.innerText()).trim();
      }
    }

    if (fields.includes('images')) {
      try {
        await page.waitForSelector('button.aoRNLd', { timeout: 5000 });
        const buttonElem = await page.$('button.aoRNLd');
        if (buttonElem) {
          await buttonElem.click();
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        const imageElems = await page.$$('.U39Pmb[style]');
        const imageUrls = await Promise.all(imageElems.map(async (elem) => {
          const styleValue = await elem.getAttribute('style');
          return styleValue ? extractBackgroundImageUrl(styleValue) : '';
        }));

        if (singleImage) {
          const firstValidImage = imageUrls.find(url => url.trim() !== '//:0');
          data.images = firstValidImage ? convertToHd(firstValidImage) : '';
        } else {
          await scrollUntilImagesStop(page);
          await new Promise(resolve => setTimeout(resolve, 2000));
          const scrolledImageElems = await page.$$('.U39Pmb[style]');
          const scrolledImageUrls = await Promise.all(scrolledImageElems.map(async (elem) => {
            const styleValue = await elem.getAttribute('style');
            return styleValue ? extractBackgroundImageUrl(styleValue) : '';
          }));
          if (scrolledImageUrls.every(url => url.trim() === '//:0')) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            const retryImageElems = await page.$$('.U39Pmb[style]');
            const retryImageUrls = await Promise.all(retryImageElems.map(async (elem) => {
              const styleValue = await elem.getAttribute('style');
              return styleValue ? extractBackgroundImageUrl(styleValue) : '';
            }));
            data.images = retryImageUrls
              .filter(url => url.trim() !== '//:0')
              .map(convertToHd)
              .join(',');
          } else {
            data.images = scrolledImageUrls
              .filter(url => url.trim() !== '//:0')
              .map(convertToHd)
              .join(',');
          }
        }
      } catch (error) {
        console.error('Error processing images:', error);
        data.images = '';
=======
    if (fields.includes('images')) {
      let firstImageUrl = '';

      // First, try to get an image without clicking gallery.
      try {
        const firstImageElem = await page.$('.U39Pmb[style]');
        if (firstImageElem) {
          const styleValue = await firstImageElem.getAttribute('style');
          firstImageUrl = styleValue ? extractBackgroundImageUrl(styleValue) : '';
        }
      } catch (error) {
        console.error('Error getting first image:', error);
      }

      // If no valid image, try opening the image gallery.
      if (!firstImageUrl || firstImageUrl.trim() === '//:0') {
        try {
          await page.waitForSelector('button.aoRNLd', { timeout: 5000 });
          const buttonElem = await page.$('button.aoRNLd');
          if (buttonElem) {
            await buttonElem.click();
            await new Promise(resolve => setTimeout(resolve, 3000));
            const firstImageElem = await page.$('.U39Pmb[style]');
            if (firstImageElem) {
              const styleValue = await firstImageElem.getAttribute('style');
              firstImageUrl = styleValue ? extractBackgroundImageUrl(styleValue) : '';
            }
          }
        } catch (error) {
          console.error('Error opening images:', error);
        }
      }
      
      if (singleImage) {
        data.images = firstImageUrl && firstImageUrl.trim() !== '//:0'
          ? convertToHd(firstImageUrl)
          : '';
      } else {
        // For multiple images, you could scroll and gather more.
        await scrollUntilImagesStop(page);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const scrolledImageElems = await page.$$('.U39Pmb[style]');
        const scrolledImageUrls = await Promise.all(scrolledImageElems.map(async (elem) => {
          const styleValue = await elem.getAttribute('style');
          return styleValue ? extractBackgroundImageUrl(styleValue) : '';
        }));
        if (scrolledImageUrls.every(url => url.trim() === '//:0')) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          const retryImageElems = await page.$$('.U39Pmb[style]');
          const retryImageUrls = await Promise.all(retryImageElems.map(async (elem) => {
            const styleValue = await elem.getAttribute('style');
            return styleValue ? extractBackgroundImageUrl(styleValue) : '';
          }));
          data.images = retryImageUrls
            .filter(url => url.trim() !== '//:0')
            .map(convertToHd)
            .join(',');
        } else {
          data.images = scrolledImageUrls
            .filter(url => url.trim() !== '//:0')
            .map(convertToHd)
            .join(',');
        }
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592
      }
    }

    return data;
  } catch (error) {
    throw error;
  }
}

function extractBackgroundImageUrl(styleValue) {
  const match = styleValue.match(/url\("?(.*?)"?\)/);
  return match ? match[1] : '';
}

function convertToHd(url) {
  return url.replace(/=w\d+-h\d+-k-no/, '=s4196-v1');
}

<<<<<<< HEAD
/**
 * Process business links in batches with staggered delays and retries.
 */
export async function processBusinessLinks(links, fields) {
  await initializeBrowser();

  // Optionally split links into batches if needed (not implemented here).
  const semaphore = new Semaphore(5);
  const results = [];
  const delayMs = 500;

  const processWithSemaphore = async (link) => {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    await semaphore.acquire();
    let page;
    try {
      // If browser is closed, reinitialize it.
      if (!browserManager.browser) {
        console.warn("Browser not available. Reinitializing...");
        await initializeBrowser();
      }
      page = await browserManager.newPage();
    } catch (error) {
      semaphore.release();
      console.error("Failed to create a new page:", error.message);
      throw new Error("Failed to create a new page: " + error.message);
    }

    try {
      const result = await processSingleLink(page, link, fields);
      results.push(result);
    } catch (error) {
      console.error(`Error processing link ${link}:`, error.message);
      results.push(createEmptyResult(fields));
    } finally {
      try {
        await page.close();
      } catch (error) {
        console.error("Error closing page:", error.message);
      }
      semaphore.release();
    }
  };

  await Promise.all(links.map(link => processWithSemaphore(link)));
  return results;
}
=======
export { initializeBrowser, closeBrowser, processBusinessLinks };
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592
