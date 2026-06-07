const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  }
}, {
  timestamps: true
});

const CommentModel = mongoose.model('Comment', CommentSchema);

// Wrap model in a dynamic Proxy to support seamless local in-memory fallback when MongoDB is offline
module.exports = new Proxy(CommentModel, {
  get: function(target, prop) {
    if (global.useMockDB) {
      return require('../config/mockDb').CommentMock[prop];
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
