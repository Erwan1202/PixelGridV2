const jwt = require('jsonwebtoken');

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

    req.user = { 
      id: payload.id, 
      role: payload.role 
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = checkJwt;