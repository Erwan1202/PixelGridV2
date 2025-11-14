const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const checkJwt = require('../middlewares/checkJwt');
const { authRateLimiter } = require('../middlewares/rateLimiter.middleware');

// Auth routes (rate-limited per IP)
router.post('/register', authRateLimiter, AuthController.register);
router.post('/login', authRateLimiter, AuthController.login);
router.post('/refresh', AuthController.refreshToken);
// Return current authenticated user
router.get('/me', checkJwt, AuthController.me);


module.exports = router;