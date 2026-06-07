const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.post('/bookmark/:postId', bookmarkController.bookmarkPost);
router.post('/unbookmark/:postId', bookmarkController.unbookmarkPost);

module.exports = router;
