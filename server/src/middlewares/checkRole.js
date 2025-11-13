// Middleware to check user role
const checkRole = (roles) => {
  return (req, res, next) => {
    // Check if the user has one of the required roles
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
};

module.exports = checkRole;