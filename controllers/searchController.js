const User = require('../models/User');
const Post = require('../models/Post');
const { extractHashtags, contentMatchesHashtag } = require('../utils/hashtag');

exports.globalSearch = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    if (!q) {
      return res.render('search', {
        title: 'Search - MiniConnect',
        query: '',
        users: [],
        posts: [],
        hashtags: [],
        currentUser: req.session.user
      });
    }

    const [users, posts] = await Promise.all([
      User.find({
        $or: [
          { username: { $regex: q, $options: 'i' } },
          { bio: { $regex: q, $options: 'i' } }
        ]
      })
        .select('username profilePicture bio')
        .limit(20),
      Post.find({ content: { $regex: q, $options: 'i' } })
        .populate('author', 'username profilePicture')
        .sort({ createdAt: -1 })
        .limit(20)
    ]);

    const hashtagQuery = q.startsWith('#') ? q : `#${q}`;
    const hashtagPosts = await Post.find({
      content: { $regex: hashtagQuery.replace('#', '\\#'), $options: 'i' }
    })
      .populate('author', 'username profilePicture')
      .limit(10);

    const hashtags = hashtagPosts.length > 0
      ? [{ tag: hashtagQuery.toLowerCase(), count: hashtagPosts.length }]
      : [];

    res.render('search', {
      title: `Search: ${q} - MiniConnect`,
      query: q,
      users,
      posts,
      hashtags,
      hashtagPosts,
      currentUser: req.session.user
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).render('500', { title: 'Internal Server Error' });
  }
};

exports.searchSuggest = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ users: [], posts: [], hashtags: [] });

    const users = await User.find({
      username: { $regex: q, $options: 'i' }
    })
      .select('username profilePicture bio')
      .limit(5);

    const posts = await Post.find({ content: { $regex: q, $options: 'i' } })
      .populate('author', 'username')
      .select('content author')
      .limit(5);

    const allPosts = await Post.find({ content: { $regex: '#', $options: 'i' } }).select('content');
    const tagSet = new Set();
    allPosts.forEach((p) => {
      extractHashtags(p.content).forEach((tag) => {
        if (tag.includes(q.toLowerCase().replace('#', ''))) {
          tagSet.add(tag);
        }
      });
    });

    const hashtags = [...tagSet].slice(0, 5).map((tag) => ({ tag }));

    res.json({ users, posts, hashtags });
  } catch (err) {
    console.error('Search suggest error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.searchByHashtag = async (req, res) => {
  try {
    const tag = req.params.tag;
    const posts = await Post.find({})
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });

    const filtered = posts.filter((p) => contentMatchesHashtag(p.content, tag));

    res.render('search', {
      title: `${tag} - MiniConnect`,
      query: tag.startsWith('#') ? tag : `#${tag}`,
      users: [],
      posts: filtered,
      hashtags: [{ tag: tag.startsWith('#') ? tag : `#${tag}`, count: filtered.length }],
      hashtagPosts: filtered,
      currentUser: req.session.user
    });
  } catch (err) {
    console.error('Hashtag search error:', err);
    res.status(500).render('500', { title: 'Internal Server Error' });
  }
};
