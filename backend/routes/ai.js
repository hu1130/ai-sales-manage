const express = require('express');
const router = express.Router();
const { analyzeLead, generateFollowUp, generateQuoteDraft, checkForAlerts } = require('../controllers/aiController');

// AI Analysis Route for Lead
router.post('/analyze-lead', analyzeLead);

// AI Follow-up Generation Route
router.get('/generate-followup/:customerId', generateFollowUp);

// AI Quote Draft Generation Route
router.post('/generate-quote-draft', generateQuoteDraft);

// AI Alert Check (e.g., run periodically)
router.get('/check-alerts', checkForAlerts);

module.exports = router;