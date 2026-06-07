const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  }
}, {
  timestamps: true
});

BookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

const BookmarkModel = mongoose.model('Bookmark', BookmarkSchema);

module.exports = new Proxy(BookmarkModel, {
  get: function(target, prop) {
    if (global.useMockDB) {
      return require('../config/mockDb').BookmarkMock[prop];
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
