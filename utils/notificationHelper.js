const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createNotification = async ({ recipientId, senderId, type, postId, message }) => {
  if (!recipientId || !senderId || recipientId.toString() === senderId.toString()) {
    return null;
  }

  const sender = await User.findById(senderId).select('username');
  if (!sender) return null;

  let text = message;
  if (!text) {
    if (type === 'like') text = `${sender.username} liked your post`;
    else if (type === 'comment') text = `${sender.username} commented on your post`;
    else if (type === 'follow') text = `${sender.username} started following you`;
  }

  return Notification.create({
    recipient: recipientId,
    sender: senderId,
    type,
    post: postId || undefined,
    message: text
  });
};

exports.getUnreadCount = async (userId) => {
  if (!userId) return 0;
  return Notification.countDocuments({ recipient: userId, read: false });
};
