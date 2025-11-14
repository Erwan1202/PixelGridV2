const express = require('express');
const router = express.Router();
const gridController = require('../controllers/grid.controller');
const checkJwt = require('../middlewares/checkJwt');
const { pixelRateLimiter } = require('../middlewares/rateLimiter.middleware');
const validate = require('../middlewares/validate.middleware');
const { placePixelSchema } = require('../validations/grid.validation');

router.get('/', gridController.getGrid);
// Apply per-user rate limiting on pixel placement
router.post('/pixel', checkJwt, validate(placePixelSchema), pixelRateLimiter, gridController.placePixel);

module.exports = router;
