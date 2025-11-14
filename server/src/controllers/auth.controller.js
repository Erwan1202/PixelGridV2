const AuthService = require('../services/auth.service');

// Authentication controller
class AuthController {

  // Register a new user
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
      }
  const user = await AuthService.register(username, email, password);
  // return object with `user` key to match API tests
  res.status(201).json({ user });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // User login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      const data = await AuthService.login(email, password);
      res.status(200).json(data);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  // User logout
  async logout(req, res) {
    try {
      // We get the user ID from the JWT payload (set by checkJwt middleware)
      const userId = req.user.id;
      if (!userId) {
        return res.status(400).json({ message: 'User not authenticated' });
      }
      await AuthService.logout(userId);
      res.status(200).json({ message: 'Successfully logged out' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to logout' });
    }
  }

  // Refresh access token using refresh token
  async refreshToken(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }
      const data = await AuthService.refreshToken(token);
      res.status(200).json(data);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  // Return current authenticated user (from checkJwt middleware)
  async me(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      // req.user is sanitized in the middleware (password_hash removed)
      // Return a consistent shape: { user }
      res.status(200).json({ user: req.user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();