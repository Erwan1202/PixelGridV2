const request = require('supertest');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('../src/graphql/schema');
const resolvers = require('../src/graphql/resolvers');
const { connectDB, pool } = require('../src/config/db');

let server;
let app;
let testUser = {
  username: 'graphqluser_' + Date.now(),
  email: `graphql_${Date.now()}@example.com`,
  password: 'Password123!',
};
let accessToken;

beforeAll(async () => {
  await connectDB();

  // Create Apollo Server
  server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ token: req.headers.authorization }),
  });

  await server.start();

  // Create Express app
  app = express();
  app.use(express.json());
  server.applyMiddleware({ app, path: '/graphql' });
});

afterAll(async () => {
  try {
    await pool.query('DELETE FROM pixel WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [testUser.email]);
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  } catch (err) {
    console.error('Error cleaning GraphQL tests:', err);
  }

  await pool.end();
  await server.stop();
});

describe('GraphQL API Tests', () => {
  describe('Mutations', () => {
    test('register - should create a new user', async () => {
      const query = `
        mutation Register($username: String!, $email: String!, $password: String!) {
          register(username: $username, email: $email, password: $password) {
            accessToken
            refreshToken
            user {
              id
              username
              email
              role
            }
          }
        }
      `;

      const variables = {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
      };

      const res = await request(app)
        .post('/graphql')
        .send({ query, variables });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.register).toBeDefined();
      expect(res.body.data.register.accessToken).toBeDefined();
      expect(res.body.data.register.refreshToken).toBeDefined();
      expect(res.body.data.register.user.email).toBe(testUser.email);
      expect(res.body.data.register.user.username).toBe(testUser.username);
    });

    test('login - should authenticate user and return tokens', async () => {
      const query = `
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            accessToken
            refreshToken
            user {
              id
              username
              email
            }
          }
        }
      `;

      const variables = {
        email: testUser.email,
        password: testUser.password,
      };

      const res = await request(app)
        .post('/graphql')
        .send({ query, variables });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.login).toBeDefined();
      expect(res.body.data.login.accessToken).toBeDefined();
      expect(res.body.data.login.user.email).toBe(testUser.email);

      accessToken = res.body.data.login.accessToken;
    });

    test('placePixel - should reject without authentication', async () => {
      const query = `
        mutation PlacePixel($x: Int!, $y: Int!, $color: String!) {
          placePixel(x: $x, y: $y, color: $color) {
            x_coord
            y_coord
            color
          }
        }
      `;

      const variables = { x: 15, y: 15, color: '#00FF00' };

      const res = await request(app)
        .post('/graphql')
        .send({ query, variables });

      expect(res.statusCode).toBe(200);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('Authentication required');
    });

    test('placePixel - should place pixel with valid token', async () => {
      const query = `
        mutation PlacePixel($x: Int!, $y: Int!, $color: String!) {
          placePixel(x: $x, y: $y, color: $color) {
            x_coord
            y_coord
            color
            user_id
          }
        }
      `;

      const variables = { x: 15, y: 15, color: '#00FF00' };

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ query, variables });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.placePixel).toBeDefined();
      expect(res.body.data.placePixel.x_coord).toBe(15);
      expect(res.body.data.placePixel.y_coord).toBe(15);
      expect(res.body.data.placePixel.color).toBe('#00FF00');
    });
  });

  describe('Queries', () => {
    test('hello - should return greeting', async () => {
      const query = `{ hello }`;

      const res = await request(app)
        .post('/graphql')
        .send({ query });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.hello).toBe('Hello from PixelGridV2 GraphQL!');
    });

    test('grid - should return pixel grid', async () => {
      const query = `
        {
          grid {
            x_coord
            y_coord
            color
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .send({ query });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.grid).toBeDefined();
      expect(Array.isArray(res.body.data.grid)).toBe(true);
    });

    test('me - should reject without authentication', async () => {
      const query = `
        {
          me {
            id
            username
            email
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .send({ query });

      expect(res.statusCode).toBe(200);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('Authentication required');
    });

    test('me - should return current user with valid token', async () => {
      const query = `
        {
          me {
            id
            username
            email
            role
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ query });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.me).toBeDefined();
      expect(res.body.data.me.email).toBe(testUser.email);
      expect(res.body.data.me.username).toBe(testUser.username);
    });

    test('users - should return list of users', async () => {
      const query = `
        {
          users {
            id
            username
            email
            role
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .send({ query });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.users).toBeDefined();
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data.users.length).toBeGreaterThan(0);
    });
  });
});
