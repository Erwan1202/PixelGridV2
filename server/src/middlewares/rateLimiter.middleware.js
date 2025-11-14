const rateLimit = require('express-rate-limit');

const PIXEL_COOLDOWN_MINUTES = 1 / 2; // 30 seconds

// Rate limiter middleware for pixel placement (per-user when authenticated)
const pixelRateLimiter = rateLimit({
  windowMs: PIXEL_COOLDOWN_MINUTES * 60 * 1000,
  max: 1,
  message: {
    message: `Vous ne pouvez placer qu'un pixel toutes les ${PIXEL_COOLDOWN_MINUTES} minute(s).`,
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip limiter during tests
  skip: () => process.env.NODE_ENV === 'test',
  // Use user id when available, otherwise fallback to IP
  keyGenerator: (req, _res) => {
    if (req.user && req.user.id) {
      return `user:${req.user.id}`;
    }
    // default IP-based limiting for unauthenticated requests
    return req.ip;
  },
});

module.exports = { pixelRateLimiter };
