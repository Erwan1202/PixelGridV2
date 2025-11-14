// server/src/app.js
const express = require('express');
const corsMiddleware = require('./middlewares/cors.middleware');
const apiRoutes = require('./routes');

const app = express();

// Middlewares
app.use(corsMiddleware);
app.options('*', corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST
app.use('/api', apiRoutes);

// Basic route to check server status
app.get('/', (req, res) => {
  res.send('PixelGridV2 API (test mode / no GraphQL / no Socket.io)');
});

module.exports = app;
