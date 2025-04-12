import { processSingleLink, initializeBrowser } from './ProcessSingle.js';

export async function processData(uniqueGoogleSearchLinks, listFields) {
  const results = [];
  const linkQueue = uniqueGoogleSearchLinks.map(link => link.trim());
  const concurrencyLimit = 8;

  try {
    // Worker function: picks one link from the queue until empty
    async function worker() {
      while (true) {
        const link = linkQueue.shift();
        if (!link) break;

        let retries = 10;
        let success = false;
        while (retries > 0 && !success) {
          try {
            const result = await processSingleLink(link, listFields);
            results.push(result);
            success = true;
          } catch (err) {
            retries--;
            if (retries === 0) {
              console.error(`Failed to process link ${link} after 3 attempts:`, err);
            } else {
              console.warn(`Retrying link ${link} (${retries} attempts remaining)`);
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Start the workers concurrently
    const workers = [];
    for (let i = 0; i < concurrencyLimit; i++) {
      workers.push(worker());
    }
    await Promise.all(workers);

    return results;
  } catch (error) {
    throw error;
  }
}