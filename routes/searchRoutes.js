const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', searchController.globalSearch);
router.get('/suggest', searchController.searchSuggest);
router.get('/hashtag/:tag', searchController.searchByHashtag);

module.exports = router;
