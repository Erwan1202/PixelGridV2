// src/middlewares/checkJwt.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Keep secret resolution consistent with AuthService
  const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

  if (!accessSecret) {
    console.error('JWT access secret not configured. Set JWT_ACCESS_SECRET or JWT_SECRET.');
    return res.status(500).json({ message: 'Server misconfiguration' });
  }

  try {
    const decoded = jwt.verify(token, accessSecret);
    req.user = decoded; // { id, role, ... }
    next();
  } catch (err) {
    console.error('JWT verify error:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
