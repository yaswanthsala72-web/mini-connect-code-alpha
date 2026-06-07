const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Bookmark = require('../models/Bookmark');
const { createNotification } = require('../utils/notificationHelper');

const populatePostQuery = (query) => query
  .populate('author', 'username profilePicture bio')
  .populate({
    path: 'comments',
    options: { sort: { createdAt: 1 } },
    populate: { path: 'author', select: 'username profilePicture' }
  });

exports.getFeed = async (req, res) => {
  try {
    const posts = await populatePostQuery(Post.find()).sort({ createdAt: -1 });
    const bookmarks = await Bookmark.find({ user: req.session.user.id });
    const savedPostIds = bookmarks.map((b) => b.post.toString());

    res.render('feed', {
      title: 'Home Feed - MiniConnect',
      posts,
      savedPostIds,
      currentUser: req.session.user
    });
  } catch (err) {
    console.error('Error fetching feed posts:', err);
    res.status(500).render('500', { title: 'Internal Server Error' });
  }
};

exports.getCreatePost = (req, res) => {
  res.render('create-post', { title: 'Create Post - MiniConnect' });
};

exports.postCreatePost = async (req, res) => {
  const { content } = req.body;
  const authorId = req.session.user.id;
  let imagePath = '';

  if (req.file) {
    imagePath = '/uploads/' + req.file.filename;
  }

  try {
    if (!content && !imagePath) {
      return res.render('create-post', {
        title: 'Create Post - MiniConnect',
        error: 'Please add some text content or upload an image.'
      });
    }

    await Post.create({
      author: authorId,
      content,
      image: imagePath || undefined
    });

    res.redirect('/');
  } catch (err) {
    console.error('Create Post Error:', err);
    res.render('create-post', {
      title: 'Create Post - MiniConnect',
      error: 'Failed to share post. Please try again.'
    });
  }
};

exports.getEditPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).render('404', { title: 'Post Not Found - MiniConnect' });
    }

    res.render('edit-post', {
      title: 'Edit Post - MiniConnect',
      post,
      currentUser: req.session.user,
      error: null
    });
  } catch (err) {
    console.error('Edit post page error:', err);
    res.status(500).render('500', { title: 'Internal Server Error' });
  }
};

exports.postEditPost = async (req, res) => {
  try {
    const post = req.post;
    const { content } = req.body;

    if (content !== undefined) post.content = content.trim();
    if (req.file) post.image = '/uploads/' + req.file.filename;

    if (!post.content && !post.image) {
      return res.render('edit-post', {
        title: 'Edit Post - MiniConnect',
        post,
        currentUser: req.session.user,
        error: 'Post must have text or an image.'
      });
    }

    await post.save();
    res.redirect('/');
  } catch (err) {
    console.error('Edit post error:', err);
    res.status(500).render('500', { title: 'Internal Server Error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = req.post._id;
    await Post.deleteOne({ _id: postId });
    await Comment.deleteMany({ post: postId });
    await Bookmark.deleteMany({ post: postId });

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true });
    }
    res.redirect('/');
  } catch (err) {
    console.error('Delete Post Error:', err);
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ error: 'Server error' });
    }
    res.redirect('/');
  }
};

exports.getDeletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session.user.id;
    const post = await Post.findById(postId);

    if (!post || post.author.toString() !== userId) {
      return res.redirect('/');
    }

    await Post.deleteOne({ _id: postId });
    await Comment.deleteMany({ post: postId });
    await Bookmark.deleteMany({ post: postId });
    res.redirect('/');
  } catch (err) {
    console.error('Delete Post Error:', err);
    res.redirect('/');
  }
};

exports.postToggleLike = async (req, res) => {
  const postId = req.params.id;
  const userId = req.session.user.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(userId);
    let liked = false;

    if (likeIndex === -1) {
      post.likes.push(userId);
      liked = true;
      await createNotification({
        recipientId: post.author,
        senderId: userId,
        type: 'like',
        postId: post._id
      });
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json({ liked, likesCount: post.likes.length });
  } catch (err) {
    console.error('Toggle Like Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.postCreateComment = async (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;
  const userId = req.session.user.id;

  try {
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await Comment.create({
      post: postId,
      author: userId,
      content: content.trim()
    });

    await createNotification({
      recipientId: post.author,
      senderId: userId,
      type: 'comment',
      postId: post._id
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username profilePicture');

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error('Add Comment Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.postIncrementView = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session.user.id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.viewedBy) post.viewedBy = [];
    if (!post.viewedBy.map(String).includes(userId)) {
      post.viewedBy.push(userId);
      post.views = (post.views || 0) + 1;
      await post.save();
    }

    res.json({
      views: post.views,
      likesCount: post.likes.length,
      commentsCount: (await Comment.find({ post: postId })).length
    });
  } catch (err) {
    console.error('View increment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
