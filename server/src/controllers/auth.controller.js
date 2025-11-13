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
      res.status(201).json(user);
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
}

module.exports = new AuthController();