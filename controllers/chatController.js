const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

exports.getChatPage = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const conversations = await Conversation.find({ participants: userId });

    const enriched = [];
    for (const conv of conversations) {
      const otherId = conv.participants.find((p) => p.toString() !== userId);
      const otherUser = await User.findById(otherId).select('username profilePicture isOnline lastSeen');
      enriched.push({ ...conv, otherUser });
    }

    let activeUser = null;
    let activeConversation = null;
    let messages = [];
    let unreadTotal = 0;

    const allUnread = await Message.find({ receiver: userId, seen: false });
    unreadTotal = Array.isArray(allUnread) ? allUnread.length : 0;

    if (req.query.user) {
      activeUser = await User.findOne({ username: req.query.user.toLowerCase() });
      if (activeUser) {
        activeConversation = await Conversation.findOne({
          participants: { $all: [userId, activeUser._id] }
        });
        if (activeConversation) {
          messages = await Message.find({ conversation: activeConversation._id });
        }
      }
    }

    res.render('chat', {
      title: 'Messages - MiniConnect',
      conversations: enriched,
      activeConversation,
      activeUser,
      messages,
      unreadTotal,
      currentUser: req.session.user
    });
  } catch (err) {
    console.error('Chat page error:', err);
    res.status(500).render('500', { title: 'Internal Server Error' });
  }
};

exports.getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) return res.status(404).json({ error: 'User not found' });

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUser._id] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, otherUser._id],
        lastMessage: { text: '', sender: userId, timestamp: new Date() }
      });
    }

    res.json({ conversationId: conversation._id, username: otherUser.username });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.conversationId });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.uploadChatImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    res.json({ imageUrl: '/uploads/' + req.file.filename });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
};
