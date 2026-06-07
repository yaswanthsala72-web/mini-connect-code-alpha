const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Secure all post routes
router.use(requireAuth);

router.get('/create', postController.getCreatePost);
router.post('/create', upload.single('image'), postController.postCreatePost);

router.post('/:id/like', postController.postToggleLike);
router.post('/:id/comment', postController.postCreateComment);
router.post('/:id/view', postController.postIncrementView);

router.get('/delete/:id', postController.getDeletePost);

module.exports = router;
