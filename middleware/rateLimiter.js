const rateLimit = require('express-rate-limit');

exports.aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many AI requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

exports.apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please slow down.' }
});
