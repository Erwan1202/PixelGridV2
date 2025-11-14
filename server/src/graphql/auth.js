const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Get authenticated user from context
const getAuthenticatedUser = async (context) => {
  const token = context.token;
  
  if (!token) {
    throw new Error('Authentication required');
  }

  // Extract token from "Bearer <token>"
  const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;

  try {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT secret not configured');
    }

    const decoded = jwt.verify(tokenValue, secret);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    if (error.message === 'JWT secret not configured') {
      throw error;
    }
    if (error.message === 'User not found') {
      throw error;
    }
    throw new Error('Invalid or expired token');
  }
};

// Check if user has required role
const requireRole = (user, allowedRoles) => {
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
};

module.exports = {
  getAuthenticatedUser,
  requireRole,
};
