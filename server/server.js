require('dotenv').config();
const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io'); 

// Import configurations, models, routes, and middlewares
const { connectDB } = require('./src/config/db');
const Pixel = require('./src/models/pixel.model');
const User = require('./src/models/user.model');

// Routes REST
const apiRoutes = require('./src/routes');

// Middlewares
const corsMiddleware = require('./src/middlewares/cors.middleware');

const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./src/graphql/schema');
const resolvers = require('./src/graphql/resolvers');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app); 

// Initialize Socket.io server
const FRONTEND_URL = process.env.FRONTEND_URL; //|| 'http://localhost:5173';
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
  },
});

app.set('io', io); 

const PORT = process.env.PORT || 3001;

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
const startServer = async () => {
  
  // Ensure DB connection
  try {
    if (process.env.SKIP_DB === 'true') {
      console.log('SKIP_DB is true: skipping database connection and table setup (dev mode).');
    } else {
      await connectDB();
      await Pixel.setupTable();
      await User.setupTable();
      console.log('Database tables checked/created.');
    }
    
    // Initialize Apollo Server for GraphQL
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({ token: req.headers.authorization }),
    });

    // Start Apollo Server
    await apolloServer.start();

    // Apply global middlewares BEFORE attaching GraphQL so CORS and body-parsing
    // apply to the /graphql endpoint as well.
    app.use(corsMiddleware);
    app.options('*', corsMiddleware);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Attach Apollo middleware (CORS disabled here because we handle it above)
    apolloServer.applyMiddleware({ app, path: '/graphql', cors: false });

    // Setup REST API routes
    app.use('/api', apiRoutes);

    // Basic route to check server status
    app.get('/', (req, res) => {
      res.send('PixelGridV2 API Running (REST at /api, GraphQL at /graphql)');
    });

    // Start HTTP server
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
