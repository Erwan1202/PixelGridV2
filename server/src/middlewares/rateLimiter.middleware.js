const rateLimit = require('express-rate-limit');

const PIXEL_COOLDOWN_MINUTES = 1/2;

// Rate limiter middleware for pixel placement
const pixelRateLimiter = rateLimit({
  windowMs: PIXEL_COOLDOWN_MINUTES * 60 * 1000,
  max: 1,
  message: {
    message: `Vous ne pouvez placer qu'un pixel toutes les ${PIXEL_COOLDOWN_MINUTES} minute(s).`,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

module.exports = { pixelRateLimiter };
