const User = require('../models/User');

exports.getFriendSuggestions = async (userId, limit = 8) => {
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) return [];

    const exclude = new Set([
      userId.toString(),
      ...(currentUser.following || []).map(String),
      ...(currentUser.followers || []).map(String)
    ]);

    const allUsers = await User.find({});
    const suggestions = (Array.isArray(allUsers) ? allUsers : [])
      .filter((u) => u && !exclude.has(u._id.toString()))
      .slice(0, limit)
      .map((u) => ({
        _id: u._id,
        username: u.username,
        bio: u.bio,
        profilePicture: u.profilePicture,
        followersCount: u.followers?.length || 0
      }));

    return suggestions;
  } catch (err) {
    console.error('Friend suggestions error:', err);
    return [];
  }
};
