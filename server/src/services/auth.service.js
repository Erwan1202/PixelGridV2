const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  console.error('JWT secrets not configured. Please set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET environment variables.');
  throw new Error('JWT secrets not configured');
}

// Authentication service
class AuthService {

  // Generate access token
  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role },
      JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
  }

  // Generate refresh token
  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  // User registration
  async register(username, email, password) {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create(username, email, passwordHash);
    delete newUser.password_hash;
    return newUser;
  }

  // User login
  async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    delete user.password_hash;
    return { accessToken, refreshToken, user };
  }

  // Refresh access token using refresh token
  async refreshToken(token) {
    try {
      const payload = jwt.verify(token, JWT_REFRESH_SECRET);
      const user = await User.findById(payload.id);

      if (!user) {
        throw new Error('User not found');
      }

      const accessToken = this.generateAccessToken(user);
      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

module.exports = new AuthService();