const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Secure all user routes
router.use(requireAuth);

router.get('/search', userController.searchUsers);
router.post('/profile/update', upload.single('profilePicture'), userController.postUpdateProfile);
router.get('/:username', userController.getProfile);

module.exports = router;
