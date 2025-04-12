import supabase from '../config/supabase.js';
import { searchGoogleMaps } from './searchService.js';
<<<<<<< HEAD
import { processData } from './MainDataPro.js';
=======
import { processBusinessLinks } from './dataProcessor.js';
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592
import { createObjectCsvWriter } from 'csv-writer';
import { saveResultsToCsv } from '../utils/csvUtils.js';
import path from 'path';

export async function runScraping(user_id, task_id) {
  try {
    // Get request data from Supabase
    const { data: requestData, error: requestError } = await supabase
      .from('scraping_requests')
      .select('*')
      .eq('user_id', user_id)
      .eq('task_id', task_id);

    if (requestError) throw requestError;
    if (!requestData || requestData.length === 0) {
      throw new Error('Request not found in Supabase');
    }

    const { keywords, country, states, fields, rating } = requestData[0];
    const listFields = fields
      ? fields.split(',').map(f => f.trim())
      : ['title', 'avg_rating', 'rating_count', 'address', 'website', 'phone', 'images'];

    // Split states by comma and trim any whitespace; use as a queue
    const stateQueue = states.split(',').map(state => state.trim());
    
    // Array to accumulate all Google search links from every state
    const GoogleSearchLinks = [];
<<<<<<< HEAD
    const concurrencyLimit = 7;
=======
    const concurrencyLimit = 3;
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592

    // Worker function: picks one state from the queue until empty.
    async function worker() {
      while (true) {
        const state = stateQueue.shift();
        if (!state) break;

        try {
          // Build the query for the current state
          const query = `${keywords}+in+${state}+${country}`;
          
          // Get links directly from Google Maps (returns an array of links)
          const links = await searchGoogleMaps(query, user_id, task_id, rating);
          
          // Accumulate the links into our global array
          GoogleSearchLinks.push(...links);
        } catch (err) {
          console.error(`Error processing state "${state}":`, err);
        }
      }
    }

    // Start the workers concurrently (with a limit of 3)
    const workers = [];
    for (let i = 0; i < concurrencyLimit; i++) {
      workers.push(worker());
    }
    await Promise.all(workers);

    // --- Create a CSV file with all accumulated links ---
    // Use a sanitized version of a combined query (using keywords and country)
    const sanitizedQuery = `${keywords}_in_${country}`.replace(/[^A-Za-z0-9]+/g, '_');
    const linksFileName = `links_${user_id}_${task_id}_${sanitizedQuery}.csv`;
    const linksFilePath = path.join(process.cwd(), 'public', linksFileName);
    const csvWriter = createObjectCsvWriter({
      path: linksFilePath,
      header: [{ id: 'href', title: 'href' }]
    });

    const uniqueGoogleSearchLinks = Array.from(new Set(GoogleSearchLinks));

    await csvWriter.writeRecords(uniqueGoogleSearchLinks.map(link => ({ href: link })));
    
<<<<<<< HEAD
    const processedResults = await processData(uniqueGoogleSearchLinks, listFields);
=======
    const processedResults = await processBusinessLinks(uniqueGoogleSearchLinks, listFields);
>>>>>>> 2502bd6d79467f3b8956fbd9c4b3431e7be8d592

    // --- Save final results to a CSV file ---
    const outputFileName = `results_${user_id}_${task_id}.csv`;
    const outputFilePath = path.join(process.cwd(), 'public', outputFileName);
    await saveResultsToCsv(outputFilePath, processedResults, listFields);

    // --- Update status in Supabase with a download link ---
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
    const downloadLink = `${baseUrl}/download/${user_id}/${task_id}`;
    await updateSupabaseStatus(user_id, task_id, 'completed', downloadLink, processedResults.length);

    return { success: true, message: 'Scraping completed' };
  } catch (error) {
    console.error('Error in scraper:', error);
    await updateSupabaseStatus(user_id, task_id, 'failed');
    throw error;
  }
}

async function updateSupabaseStatus(user_id, task_id, status, result_url, row_count) {
  const updateData = {
    status,
    updated_at: new Date().toISOString()
  };

  if (result_url) updateData.result_url = result_url;
  if (row_count) updateData.row_count = row_count;

  const { error } = await supabase
    .from('scraping_requests')
    .update(updateData)
    .eq('user_id', user_id)
    .eq('task_id', task_id);

  if (error) throw error;
}
