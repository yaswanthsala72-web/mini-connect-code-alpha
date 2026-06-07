const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth } = require('../middleware/auth');

// Root Route - maps to Feed
router.get('/', requireAuth, postController.getFeed);

module.exports = router;
