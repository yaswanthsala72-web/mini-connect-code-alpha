const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth } = require('../middleware/auth');
const { requirePostOwner } = require('../middleware/postOwner');
const upload = require('../middleware/upload');

router.use(requireAuth);
router.get('/edit/:id', requirePostOwner, postController.getEditPost);
router.post('/edit/:id', requirePostOwner, upload.single('image'), postController.postEditPost);
router.delete('/:id', requirePostOwner, postController.deletePost);

module.exports = router;
