const express = require('express');
const router = express.Router();
const GridController = require('../controllers/grid.controller');
const { pixelRateLimiter } = require('../middlewares/rateLimiter.middleware');

// Placeholder JWT check middleware
const placeholderCheckJwt = (req, res, next) => {
  console.log('Placeholder JWT check: Simulating user attachment');
  req.user = { id: 1, role: 'user' }; 
  next();
};

// Route to get the current state of the grid
router.get('/', GridController.getGrid);

// Route to place a pixel on the grid
router.post(
  '/pixel',
  placeholderCheckJwt, 
  pixelRateLimiter,
  GridController.placePixel
);

module.exports = router;