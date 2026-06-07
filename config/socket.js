const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const onlineUsers = new Map();

module.exports = function initSocket(io) {
  io.use((socket, next) => {
    const session = socket.request.session;
    if (session?.user) {
      socket.userId = session.user.id;
      socket.username = session.user.username;
      return next();
    }
    next(new Error('Unauthorized'));
  });

  io.on('connection', async (socket) => {
    onlineUsers.set(socket.userId, { socketId: socket.id, lastSeen: new Date() });
    await User.findByIdAndUpdate(socket.userId, { $set: { isOnline: true, lastSeen: new Date() } });

    io.emit('user:online', { userId: socket.userId, username: socket.username });
    io.emit('users:online', Array.from(onlineUsers.keys()));

    socket.on('join_room', (conversationId) => {
      socket.join(`conv:${conversationId}`);
      socket.emit('join_room', { conversationId });
    });

    socket.on('conversation:join', (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on('send_message', async (data) => {
      await handleSendMessage(io, socket, data);
    });

    socket.on('message:send', async (data) => {
      await handleSendMessage(io, socket, data);
    });

    socket.on('message:seen', async (data) => {
      try {
        const { conversationId } = data;
        await Message.updateMany(
          { conversation: conversationId, receiver: socket.userId, seen: false },
          { $set: { seen: true, delivered: true } }
        );
        io.to(`conv:${conversationId}`).emit('message_seen', { conversationId, userId: socket.userId });
        io.to(`conv:${conversationId}`).emit('message:seen', { conversationId, userId: socket.userId });
      } catch (err) {
        console.error('Seen error:', err);
      }
    });

    socket.on('typing', (data) => {
      socket.to(`conv:${data.conversationId}`).emit('typing', { userId: socket.userId, username: socket.username });
    });

    socket.on('typing:start', (data) => {
      socket.to(`conv:${data.conversationId}`).emit('typing:start', { userId: socket.userId, username: socket.username });
      socket.to(`conv:${data.conversationId}`).emit('typing', { userId: socket.userId, username: socket.username });
    });

    socket.on('stop_typing', (data) => {
      socket.to(`conv:${data.conversationId}`).emit('stop_typing', { userId: socket.userId });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`conv:${data.conversationId}`).emit('typing:stop', { userId: socket.userId });
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(socket.userId);
      await User.findByIdAndUpdate(socket.userId, { $set: { isOnline: false, lastSeen: new Date() } });
      io.emit('user:offline', { userId: socket.userId });
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });
  });
};

async function handleSendMessage(io, socket, data) {
  try {
    const { conversationId, receiverId, text, image } = data;
    if (!text?.trim() && !image) return;

    let conversation = conversationId ? await Conversation.findById(conversationId) : null;
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [socket.userId, receiverId],
        lastMessage: { text: text?.trim() || '📷 Image', sender: socket.userId, timestamp: new Date() }
      });
    } else {
      conversation.lastMessage = {
        text: text?.trim() || '📷 Image',
        sender: socket.userId,
        timestamp: new Date()
      };
      await conversation.save();
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: socket.userId,
      receiver: receiverId,
      text: text?.trim() || '',
      image: image || '',
      delivered: true,
      seen: false
    });

    const sender = await User.findById(socket.userId).select('username profilePicture');
    const payload = {
      _id: message._id,
      conversationId: conversation._id,
      sender: { _id: socket.userId, username: sender?.username, profilePicture: sender?.profilePicture },
      receiverId,
      text: message.text,
      image: message.image,
      delivered: true,
      seen: false,
      createdAt: message.createdAt
    };

    io.to(`conv:${conversation._id}`).emit('receive_message', payload);
    io.to(`conv:${conversation._id}`).emit('message:receive', payload);

    const receiverOnline = onlineUsers.get(receiverId);
    if (receiverOnline) {
      io.to(receiverOnline.socketId).emit('message:notify', payload);
    }
  } catch (err) {
    console.error('Socket message error:', err);
    socket.emit('message:error', { error: 'Failed to send message' });
  }
}
