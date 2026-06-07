const User = require('../models/User');
const Post = require('../models/Post');
const Bookmark = require('../models/Bookmark');

exports.getProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const userProfile = await User.findOne({ username: username.toLowerCase().trim() });
    if (!userProfile) {
      return res.status(404).render('404', { title: 'User Not Found - MiniConnect' });
    }

    const posts = await Post.find({ author: userProfile._id })
      .populate('author', 'username profilePicture bio')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: 1 } },
        populate: { path: 'author', select: 'username profilePicture' }
      })
      .sort({ createdAt: -1 });

    const isOwnProfile = userProfile._id.toString() === req.session.user.id;
    const isFollowing = !isOwnProfile && (userProfile.followers || [])
      .map(String)
      .includes(req.session.user.id);

    const bookmarks = await Bookmark.find({ user: req.session.user.id });
    const savedPostIds = bookmarks.map((b) => b.post.toString());

    res.render('profile', {
      title: `${userProfile.username}'s Profile - MiniConnect`,
      userProfile,
      posts,
      currentUser: req.session.user,
      isFollowing,
      savedPostIds,
      followersCount: userProfile.followers?.length || 0,
      followingCount: userProfile.following?.length || 0,
      error: null,
      success: null
    });
  } catch (err) {
    console.error('Profile Load Error:', err);
    res.status(500).render('500', { title: 'Internal Server Error' });
  }
};

exports.postUpdateProfile = async (req, res) => {
  const { bio } = req.body;
  const userId = req.session.user.id;
  const updateData = {};

  if (bio !== undefined) updateData.bio = bio.trim();
  if (req.file) updateData.profilePicture = '/uploads/' + req.file.filename;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).render('404', { title: 'User Not Found - MiniConnect' });
    }

    req.session.user.bio = updatedUser.bio;
    req.session.user.profilePicture = updatedUser.profilePicture;
    res.redirect(`/users/${updatedUser.username}`);
  } catch (err) {
    console.error('Update Profile Error:', err);
    const userProfile = await User.findById(userId);
    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });

    res.render('profile', {
      title: `${userProfile.username}'s Profile - MiniConnect`,
      userProfile,
      posts,
      currentUser: req.session.user,
      isFollowing: false,
      savedPostIds: [],
      followersCount: userProfile.followers?.length || 0,
      followingCount: userProfile.following?.length || 0,
      error: 'Failed to update profile. Please try again.',
      success: null
    });
  }
};

exports.searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    if (!query || query.trim() === '') {
      return res.json([]);
    }

    const users = await User.find({
      username: { $regex: query.trim(), $options: 'i' }
    })
      .select('username profilePicture bio')
      .limit(8);

    res.json(users);
  } catch (err) {
    console.error('Search Users Error:', err);
    res.status(500).json({ error: 'Failed to query users' });
  }
};
