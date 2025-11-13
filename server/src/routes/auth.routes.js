const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const checkJwt = require('../middlewares/checkJwt');

// Auth routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);
// Return current authenticated user
router.get('/me', checkJwt, AuthController.me);

// Protected route example
router.get('/me', checkJwt, (req, res) => {
    res.status(200).json({ user: req.user });
});

module.exports = router;