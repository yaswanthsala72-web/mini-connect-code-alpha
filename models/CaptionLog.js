const mongoose = require('mongoose');

const CaptionLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: String,
  keywords: String,
  mood: String,
  imageDescription: String,
  creative: String,
  professional: String,
  short: String,
  hashtags: [String],
  source: { type: String, enum: ['gemini', 'fallback'], default: 'gemini' }
}, { timestamps: true });

CaptionLogSchema.index({ user: 1, createdAt: -1 });

const CaptionLogModel = mongoose.model('CaptionLog', CaptionLogSchema);

module.exports = new Proxy(CaptionLogModel, {
  get(target, prop) {
    if (global.useMockDB) return require('../config/mockDb').CaptionLogMock[prop];
    return target[prop];
  },
  construct(target, args) {
    if (global.useMockDB) return args[0];
    return new target(...args);
  }
});
