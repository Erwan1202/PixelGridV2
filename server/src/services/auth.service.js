const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Read JWT secrets lazily so the module can be imported during build
// (some hosting platforms set env vars only at runtime). The function
// will throw only when a token operation actually needs the secrets.
function getJwtSecrets() {
  const access = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  const refresh = process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET_LEGACY;

  if (!access || !refresh) {
    console.error('JWT secrets not configured. Please set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET environment variables.');
    throw new Error('JWT secrets not configured');
  }

  return { access, refresh };
}

// Authentication service
class AuthService {

  // Generate access token
  generateAccessToken(user) {
    const { access } = getJwtSecrets();
    return jwt.sign({ id: user.id, role: user.role }, access, { expiresIn: '15m' });
  }

  // Generate refresh token
  generateRefreshToken(user) {
    const { refresh } = getJwtSecrets();
    return jwt.sign({ id: user.id }, refresh, { expiresIn: '7d' });
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
      const { refresh } = getJwtSecrets();
      const payload = jwt.verify(token, refresh);
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