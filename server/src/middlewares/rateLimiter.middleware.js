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

// IP-based limiter for auth endpoints to mitigate brute force
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // allow up to 10 attempts per IP per window
  message: { message: 'Trop de tentatives, réessayez plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  keyGenerator: (req) => req.ip,
});

module.exports = { pixelRateLimiter, authRateLimiter };
