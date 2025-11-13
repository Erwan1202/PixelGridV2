const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware to check JWT token and authenticate user
const checkJwt = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if the authorization header is present and properly formatted
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided or invalid format' });
  }

  const token = authHeader.split(' ')[1];

  // Verify the token and extract the payload
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
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