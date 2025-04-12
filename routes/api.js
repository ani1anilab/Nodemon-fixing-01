import express from 'express';
import { updateStatus, getStatus } from '../controllers/statusController.js';
import { downloadFile } from '../controllers/downloadController.js';
import { startScraping } from '../controllers/scrapingController.js';

const router = express.Router();

// Status update endpoint
router.post('/update_status', updateStatus);

// File download endpoint
router.get('/download/:user_id/:task_id', downloadFile);

// Scraping request endpoint
router.post('/check_request', startScraping);

// Status check endpoint
router.get('/status/:user_id/:task_id', getStatus);

export default router;