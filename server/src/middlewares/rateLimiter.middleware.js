const rateLimit = require('express-rate-limit');

// Configuration ratelimiter for pixel placement
const pixelRateLimiter = rateLimit({
  windowMs: 30 * 1000, 
  max: 1, 
  message: {
    message: 'Too many pixels placed recently, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { pixelRateLimiter };
