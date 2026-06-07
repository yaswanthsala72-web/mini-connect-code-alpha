const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow'],
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

NotificationSchema.index({ recipient: 1, createdAt: -1 });

const NotificationModel = mongoose.model('Notification', NotificationSchema);

module.exports = new Proxy(NotificationModel, {
  get: function(target, prop) {
    if (global.useMockDB) {
      return require('../config/mockDb').NotificationMock[prop];
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
