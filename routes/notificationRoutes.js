const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', notificationController.getNotifications);
router.get('/api', notificationController.getNotificationsApi);
router.post('/read/:id', notificationController.markAsRead);
router.post('/read-all', notificationController.markAllAsRead);

module.exports = router;
