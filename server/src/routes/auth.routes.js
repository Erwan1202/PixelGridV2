const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const checkJwt = require('../middlewares/checkJwt');
const { authRateLimiter } = require('../middlewares/rateLimiter.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../validations/auth.validation');

// Auth routes (rate-limited per IP)
router.post('/register', authRateLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authRateLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refreshToken);
// Return current authenticated user
router.get('/me', checkJwt, AuthController.me);


module.exports = router;