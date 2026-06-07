const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', bookmarkController.getSavedPosts);

module.exports = router;
