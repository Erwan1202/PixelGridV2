const User = require('../models/user.model');
const Pixel = require('../models/pixel.model');
const { pool } = require('../config/db'); 

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
  },
};

module.exports = resolvers;