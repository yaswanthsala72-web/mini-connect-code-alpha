const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(requireAuth);
router.get('/', chatController.getChatPage);
router.get('/conversation/:userId', chatController.getOrCreateConversation);
router.get('/messages/:conversationId', chatController.getMessages);
router.post('/upload-image', upload.single('image'), chatController.uploadChatImage);

module.exports = router;
