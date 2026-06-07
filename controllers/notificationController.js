const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username profilePicture')
      .populate('post', 'content image')
      .sort({ createdAt: -1 })
      .limit(50);

    res.render('notifications', {
      title: 'Notifications - MiniConnect',
      notifications,
      currentUser: req.session.user
    });
  } catch (err) {
    console.error('Notifications error:', err);
    res.status(500).render('500', { title: 'Internal Server Error' });
  }
};

exports.getNotificationsApi = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(10);

    const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Notifications API error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.session.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();

    const unreadCount = await Notification.countDocuments({
      recipient: req.session.user.id,
      read: false
    });

    res.json({ success: true, unreadCount });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.session.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true, unreadCount: 0 });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
