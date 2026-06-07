const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  image: {
    type: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

PostSchema.index({ content: 'text' });

PostSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post'
});

const PostModel = mongoose.model('Post', PostSchema);

module.exports = new Proxy(PostModel, {
  get: function(target, prop) {
    if (global.useMockDB) {
      return require('../config/mockDb').PostMock[prop];
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
