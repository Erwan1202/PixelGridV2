const User = require('../models/user.model');
const Pixel = require('../models/pixel.model');
const { pool } = require('../config/db');
const AuthService = require('../services/auth.service');
const GridService = require('../services/grid.service');
const { getAuthenticatedUser } = require('./auth');

// GraphQL resolvers
const resolvers = {
  Query: {
    hello: () => 'Hello from PixelGridV2 GraphQL!',
    
    // Fetch all users
    users: async () => {
      try {
        const result = await pool.query('SELECT id, username, email, role FROM users');
        return result.rows;
      } catch (error) {
        console.error(error);
        throw new Error('Error fetching users');
      }
    },

    // Fetch pixel grid state
    grid: async () => {
      try {
        const gridState = await Pixel.getState();
        return gridState;
      } catch (error) {
        console.error(error);
        throw new Error('Error fetching grid state');
      }
    },

    // Get authenticated user
    me: async (_parent, _args, context) => {
      const user = await getAuthenticatedUser(context);
      delete user.password_hash;
      return user;
    },
  },

  Mutation: {
    // User registration
    register: async (_parent, { username, email, password }) => {
      try {
        const user = await AuthService.register(username, email, password);
        const accessToken = AuthService.generateAccessToken(user);
        const refreshToken = AuthService.generateRefreshToken(user);
        
        return {
          accessToken,
          refreshToken,
          user,
        };
      } catch (error) {
        throw new Error(error.message || 'Registration failed');
      }
    },

    // User login
    login: async (_parent, { email, password }) => {
      try {
        const result = await AuthService.login(email, password);
        return result;
      } catch (error) {
        throw new Error(error.message || 'Login failed');
      }
    },

    // Place a pixel
    placePixel: async (_parent, { x, y, color }, context) => {
      const user = await getAuthenticatedUser(context);
      
      try {
        const pixel = await GridService.placePixel(x, y, color, user.id);
        return pixel;
      } catch (error) {
        throw new Error(error.message || 'Failed to place pixel');
      }
    },
  },
};

module.exports = resolvers;