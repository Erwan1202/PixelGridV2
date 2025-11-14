const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware to check and verify JWT
const checkJwt = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided or invalid format' });
  }

  const token = authHeader.split(' ')[1];

  // Verify token
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Fetch full user from DB and attach to req.user (omit password_hash)
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    // Remove sensitive fields
    delete user.password_hash;

    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = checkJwt;