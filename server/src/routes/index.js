const express = require('express');
const router = express.Router();

// Import routes
const gridRoutes = require('./grid.routes');


// Use routes
router.use('/grid', gridRoutes);

module.exports = router;