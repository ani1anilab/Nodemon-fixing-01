import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

export async function saveResultsToCsv(filePath, results, fields) {
  if (!filePath || !Array.isArray(results) || !Array.isArray(fields) || fields.length === 0) {
    throw new Error('Invalid input parameters');
  }

  try {
    // Create CSV writer with headers
    const csvWriter = createCsvWriter({
      path: filePath,
      header: fields.map(field => ({
        id: field,
        title: field
      })),
      encoding: 'utf8',
      alwaysQuote: true,
      fieldDelimiter: ',',
      recordDelimiter: '\n'
    });

    // Write records (the CSV writer handles writing the header)
    await csvWriter.writeRecords(results);
    
    return true;
  } catch (error) {
    console.error('Error saving CSV:', error);
    throw new Error('Failed to save CSV: ' + error.message);
  }
}
