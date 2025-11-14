const express = require('express');
const router = express.Router();

// Import routes
const gridRoutes = require('./grid.routes');
const authRoutes = require('./auth.routes');

// Use routes
router.use('/grid', gridRoutes);
router.use('/auth', authRoutes);

module.exports = router;