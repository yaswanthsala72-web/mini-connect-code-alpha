const Bookmark = require('../models/Bookmark');
const Post = require('../models/Post');

exports.bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.session.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existing = await Bookmark.findOne({ user: userId, post: postId });
    if (existing) {
      return res.json({ saved: true });
    }

    await Bookmark.create({ user: userId, post: postId });
    res.json({ saved: true });
  } catch (err) {
    console.error('Bookmark error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.unbookmarkPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.session.user.id;

    await Bookmark.deleteOne({ user: userId, post: postId });
    res.json({ saved: false });
  } catch (err) {
    console.error('Unbookmark error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const bookmarks = await Bookmark.find({ user: userId }).sort({ createdAt: -1 });
    const postIds = bookmarks.map((b) => b.post);

    const posts = await Post.find({ _id: { $in: postIds } })
      .populate('author', 'username profilePicture bio')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: 1 } },
        populate: { path: 'author', select: 'username profilePicture' }
      })
      .sort({ createdAt: -1 });

    const savedPostIds = postIds.map((id) => id.toString());

    res.render('saved-posts', {
      title: 'Saved Posts - MiniConnect',
      posts,
      savedPostIds,
      currentUser: req.session.user
    });
  } catch (err) {
    console.error('Saved posts error:', err);
    res.status(500).render('500', { title: 'Internal Server Error' });
  }
};
