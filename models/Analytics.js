const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  profileViews: { type: Number, default: 0 },
  dailyFollowers: [{ date: String, count: Number }],
  weeklyFollowers: [{ week: String, count: Number }],
  monthlyFollowers: [{ month: String, count: Number }],
  likesHistory: [{ date: String, count: Number }],
  engagementHistory: [{ date: String, rate: Number }]
}, { timestamps: true });

const AnalyticsModel = mongoose.model('Analytics', AnalyticsSchema);

module.exports = new Proxy(AnalyticsModel, {
  get(target, prop) {
    if (global.useMockDB) return require('../config/mockDb').AnalyticsMock[prop];
    return target[prop];
  },
  construct(target, args) {
    if (global.useMockDB) return args[0];
    return new target(...args);
  }
});
