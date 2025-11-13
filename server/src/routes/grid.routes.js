const express = require('express');
const router = express.Router();
const GridController = require('../controllers/grid.controller');
const { pixelRateLimiter } = require('../middlewares/rateLimiter.middleware');
const checkJwt = require('../middlewares/checkJwt');

// Route to get the current state of the grid
router.get('/', GridController.getGrid);

// Route to place a pixel on the grid
router.post(
  '/pixel',
  checkJwt,
  pixelRateLimiter,
  GridController.placePixel
);

module.exports = router;