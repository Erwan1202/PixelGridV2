require('dotenv').config();
const express = require('express');
const http = require('http');
const PORT = process.env.PORT || 3001;
const { connectDB } = require('./src/config/db');
const Pixel = require('./src/models/pixel.model');
const User = require('./src/models/user.model');
const apiRoutes = require('./src/routes');
const corsMiddleware = require('./src/middlewares/cors.middleware');
const { Server: IOServer } = require('socket.io');

// Apollo
const { ApolloServer } = require('apollo-server-express'); 
const typeDefs = require('./src/graphql/schema');
const resolvers = require('./src/graphql/resolvers');

const app = express();
const server = http.createServer(app); 

const startServer = async () => {
  try {
    await connectDB();
    await Pixel.setupTable();
    await User.setupTable();
    console.log('Database tables checked/created.');

    // Init Apollo Server
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({ token: req.headers.authorization }) 
    });

    await apolloServer.start();

    app.use(corsMiddleware);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Apply Apollo Middleware
    apolloServer.applyMiddleware({ app, path: '/graphql' }); 

    // REST API Routes
    app.use('/api', apiRoutes);

    // Initialize Socket.IO and attach to the HTTP server so the client can connect
    const io = new IOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Make io available via app (optional) for other modules
    app.set('io', io);

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', socket.id, 'reason:', reason);
      });
    });

    app.get('/', (req, res) => {
      res.send('PixelGridV2 API Running (REST at /api, GraphQL at /graphql)');
    });

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