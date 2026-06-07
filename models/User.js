const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: 'Hey there! I am using MiniConnect.',
    maxlength: 150
  },
  profilePicture: {
    type: String,
    default: '/images/default-avatar.svg'
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

UserSchema.index({ username: 'text', bio: 'text' });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model('User', UserSchema);

module.exports = new Proxy(UserModel, {
  get: function(target, prop) {
    if (global.useMockDB) {
      return require('../config/mockDb').UserMock[prop];
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
