require('dotenv').config();
const express = require('express');

const { connectDB } = require('./src/config/db');

const Pixel = require('./src/models/pixel.model'); 
const apiRoutes = require('./src/routes');
const corsMiddleware = require('./src/middlewares/cors.middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Start the server after ensuring DB connection and Pixel table setup
const startServer = async () => {
  try {

    // Connect to the database
    await connectDB();
    await Pixel.setupTable(); 
    console.log('Pixel table checked/created.');

    // Middlewares
    app.use(corsMiddleware);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Use API routes
    app.use('/api', apiRoutes);

    // Basic route to check server status
    app.get('/', (req, res) => {
      res.send('PixelGridV2 API Running');
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();