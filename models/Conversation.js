const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    text: { type: String, default: '' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

ConversationSchema.index({ participants: 1 });

const ConversationModel = mongoose.model('Conversation', ConversationSchema);

module.exports = new Proxy(ConversationModel, {
  get: function(target, prop) {
    if (global.useMockDB) {
      return require('../config/mockDb').ConversationMock[prop];
    }
    return target[prop];
  },
  construct: function(target, args) {
    if (global.useMockDB) {
      return args[0];
    }
    return new target(...args);
  }
});
