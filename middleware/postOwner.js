const Post = require('../models/Post');

exports.requirePostOwner = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(404).json({ error: 'Post not found' });
      }
      return res.status(404).render('404', { title: 'Post Not Found - MiniConnect' });
    }

    if (post.author.toString() !== req.session.user.id) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      return res.redirect('/');
    }

    req.post = post;
    next();
  } catch (err) {
    console.error('Post owner middleware error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
