require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server: IOServer } = require('socket.io');

const PORT = process.env.PORT || 3001;

// DB + modèles
const { connectDB } = require('./src/config/db');
const Pixel = require('./src/models/pixel.model');
const User = require('./src/models/user.model');

// Routes REST
const apiRoutes = require('./src/routes');

// Middlewares
const corsMiddleware = require('./src/middlewares/cors.middleware');

// Apollo GraphQL
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./src/graphql/schema');
const resolvers = require('./src/graphql/resolvers');

// Start the server
const startServer = async () => {
  
  // Ensure DB connection
  try {
    await connectDB();

    const app = express();
    const server = http.createServer(app);

    const io = new IOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    app.set('io', io);

    app.use(corsMiddleware);
    app.use(express.json());

    app.use('/api', apiRoutes);

    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
    });

    // Start Apollo Server
    await apolloServer.start();
    apolloServer.applyMiddleware({
      app,
      path: '/graphql',
      cors: false,
    });

    // Socket.IO connection handler
    io.on('connection', (socket) => {
      console.log('Client connecté via WebSocket :', socket.id);

      socket.on('disconnect', () => {
        console.log('Client déconnecté :', socket.id);
      });
    });

    app.get('/', (req, res) => {
      res.send('PixelGridV2 API Running (REST at /api, GraphQL at /graphql)');
    });

    // Start listening
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`GraphQL endpoint at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
