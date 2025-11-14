const express = require('express');
const router = express.Router();
const gridController = require('../controllers/grid.controller');
const checkJwt = require('../middlewares/checkJwt');

router.get('/', gridController.getGrid);
router.post('/pixel', checkJwt, gridController.placePixel);

module.exports = router;
