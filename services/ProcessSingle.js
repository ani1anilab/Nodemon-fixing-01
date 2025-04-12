import BrowserManager from '../browser/browserManager.js';
import { getLocationFromAddress } from '../utils/areaUtils.js';
import { getExtensionPath } from '../browser/extensions.js';
import { scrollUntilImagesStop } from '../utils/scrollUtils.js';

// Create a browser manager instance
const browserManager = new BrowserManager();
browserManager.useExtension(getExtensionPath('rektCaptcha-extension'));

// Use a promise lock to avoid race conditions during initialization
let browserInitializationPromise = null;

export async function initializeBrowser() {
  if (!browserManager.browser && !browserInitializationPromise) {
    browserInitializationPromise = browserManager.initialize();
  }
  await browserInitializationPromise;
}

export async function closeBrowser() {
  await browserManager.close();
}

export async function processSingleLink(link, fields, singleImage = true) {
  const data = Object.fromEntries(fields.map(field => [field, '']));

  // Wait for the browser to be initialized (using our promise lock)
    if (!browserManager.browser) {
      await initializeBrowser();
    }

  const page = await browserManager.newPage();
  try {
    // Navigate to the link with retry logic
    let retries = 5;
    while (retries > 0) {
      try {
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    await page.waitForSelector('h1.DUwDvf', { timeout: 60000 });

    // Process each field
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

    if (fields.includes('category')) {
      const categoryElem = await page.$("button.DkEaL");
      if (categoryElem) {
        data.category = (await categoryElem.innerText()).trim();
      }
    }

    if (fields.includes('images')) {
      let imageRetries = 3;
      while (imageRetries > 0) {
        try {
          let clickedElement = false;
          // --- Attempt to click primary button or fallbacks ---
          try {
            console.log("Attempting to click primary button 'button.aoRNLd' (5s timeout)...");
            const primaryButton = await page.waitForSelector('button.aoRNLd', { timeout: 5000, visible: true });
            if (primaryButton) {
              await primaryButton.click();
              clickedElement = true;
              console.log("Clicked primary button.");
              await new Promise(resolve => setTimeout(resolve, 3000)); // Wait after click
            }
          } catch (e) {
            console.log("Primary button 'button.aoRNLd' not found or clicked within 5s.");
          }

          if (!clickedElement) {
            try {
              console.log("Attempting to click fallback 1 'div.YkuOqf'...");
              const fallback1 = await page.$('div.YkuOqf');
              if (fallback1) {
                await fallback1.click();
                clickedElement = true;
                console.log("Clicked fallback 1.");
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait after click
              } else {
                 console.log("Fallback 1 not found.");
              }
            } catch (e) {
              console.log("Error clicking fallback 1:", e.message);
            }
          }

          if (!clickedElement) {
            try {
              console.log("Attempting to click fallback 2 'div.RZ66Rb.FgCUCc img'...");
              // Note: Clicking an img might not trigger the same UI changes as a button
              const fallback2 = await page.$('div.RZ66Rb.FgCUCc img');
              if (fallback2) {
                await fallback2.click(); // This might just navigate or do nothing useful
                clickedElement = true;
                console.log("Clicked fallback 2 (img).");
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait after click
              } else {
                 console.log("Fallback 2 not found.");
              }
            } catch (e) {
              console.log("Error clicking fallback 2:", e.message);
            }
          }

          if (!clickedElement) {
            console.log("No specific element clicked, proceeding to image extraction directly.");
          }

          // --- Proceed with image extraction using the standard selector ---
          console.log("Waiting for image elements '.U39Pmb[style]'...");
          await page.waitForSelector('.U39Pmb[style]', { timeout: 10000 }); // Wait for images to potentially load

          console.log("Extracting image URLs from '.U39Pmb[style]' elements...");
          const imageElems = await page.$$('.U39Pmb[style]');
          const imageUrls = await Promise.all(imageElems.map(async (elem) => {
            const styleValue = await elem.getAttribute('style');
            return styleValue ? extractBackgroundImageUrl(styleValue) : '';
          }));

          if (singleImage) {
            const firstValidImage = imageUrls.find(url => url && url.trim() !== '//:0');
            data.images = firstValidImage ? convertToHd(firstValidImage) : '';
            console.log(`Single image processed: ${data.images || 'None found'}`);
          } else {
            console.log("Processing multiple images, scrolling...");
            await scrollUntilImagesStop(page); // Assumes this handles its own potential errors
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait after scrolling

            const scrolledImageElems = await page.$$('.U39Pmb[style]');
            const scrolledImageUrls = await Promise.all(scrolledImageElems.map(async (elem) => {
              const styleValue = await elem.getAttribute('style');
              return styleValue ? extractBackgroundImageUrl(styleValue) : '';
            }));

            // Check if images loaded correctly after scroll, maybe log if still empty
            if (scrolledImageUrls.every(url => !url || url.trim() === '//:0')) {
               console.warn('No valid image URLs found even after scrolling.');
               // Decide if another wait/retry *within* the attempt is needed or just accept empty
               // For now, we just proceed with the potentially empty list from scrolledImageUrls
            }

            data.images = scrolledImageUrls
              .filter(url => url && url.trim() !== '//:0')
              .map(convertToHd)
              .join(',');
             console.log(`Multiple images processed: ${data.images.split(',').length} found.`);
          }
          // --- End of image processing logic ---

          console.log('Image processing attempt successful.');
          break; // Success, exit the retry loop

        } catch (error) {
          imageRetries--;
          console.error(`Error processing images (attempt ${3 - imageRetries}/3):`, error.message);

          if (imageRetries === 0) {
            console.error('Image processing failed after 3 attempts.');
            data.images = '';
          } else {
            console.log(`Retrying image processing after page refresh... (${imageRetries} attempts left)`);
            try {
              await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
              // Wait for a key element to ensure page is ready after reload
              await page.waitForSelector('h1.DUwDvf', { timeout: 60000 });
              await new Promise(resolve => setTimeout(resolve, 3000)); 
            } catch (reloadError) {
              console.error('Error reloading page during retry:', reloadError.message);
              imageRetries = 0; 
              data.images = '';
              break; 
            }
          }
        }
      }
    }

    return data;
  } catch (error) {
    throw error;
  } finally {
    await page.close();
  }
}

function extractBackgroundImageUrl(styleValue) {
  const match = styleValue.match(/url\("?(.*?)"?\)/);
  return match ? match[1] : '';
}

function convertToHd(url) {
  return url.replace(/=w\d+-h\d+-k-no/, '=s4196-v1');
}