const express = require('express');
const router = express.Router();
const captionController = require('../controllers/captionController');
const { requireAuth } = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { validateCaptionInput } = require('../middleware/validateCaption');

router.use(requireAuth);
router.post('/generate-caption', aiRateLimiter, validateCaptionInput, captionController.generateCaption);

module.exports = router;
