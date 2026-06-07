const User = require('../models/User');
const { createNotification } = require('../utils/notificationHelper');

exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.userId;
    const currentUserId = req.session.user.id;

    if (targetId === currentUserId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: currentUserId } });

    await createNotification({
      recipientId: targetId,
      senderId: currentUserId,
      type: 'follow'
    });

    const updated = await User.findById(targetId);
    const current = await User.findById(currentUserId);

    res.json({
      following: true,
      followersCount: updated.followers?.length || 0,
      followingCount: current.following?.length || 0
    });
  } catch (err) {
    console.error('Follow error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.userId;
    const currentUserId = req.session.user.id;

    if (targetId === currentUserId) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { followers: currentUserId } });

    const updated = await User.findById(targetId);
    const current = await User.findById(currentUserId);

    res.json({
      following: false,
      followersCount: updated?.followers?.length || 0,
      followingCount: current?.following?.length || 0
    });
  } catch (err) {
    console.error('Unfollow error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
