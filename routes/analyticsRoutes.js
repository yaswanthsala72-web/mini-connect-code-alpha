const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', analyticsController.getDashboard);

module.exports = router;
