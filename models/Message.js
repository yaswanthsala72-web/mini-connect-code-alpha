const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  delivered: {
    type: Boolean,
    default: false
  },
  seen: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

MessageSchema.index({ conversation: 1, createdAt: 1 });

const MessageModel = mongoose.model('Message', MessageSchema);

module.exports = new Proxy(MessageModel, {
  get: function(target, prop) {
    if (global.useMockDB) {
      return require('../config/mockDb').MessageMock[prop];
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
