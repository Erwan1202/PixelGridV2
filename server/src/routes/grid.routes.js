const express = require('express');
const router = express.Router();
const gridController = require('../controllers/grid.controller');
const checkJwt = require('../middlewares/checkJwt');

// Mounted at `/api/grid` in routes/index.js
// So base path here should be `/` (not `/grid`)
router.get('/', gridController.getGrid);
router.post('/pixel', checkJwt, gridController.placePixel);

module.exports = router;
