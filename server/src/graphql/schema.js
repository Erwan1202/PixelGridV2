const { gql } = require('apollo-server-express');

// GraphQL type definitions
const typeDefs = gql`
  type Query { # Root query type
    hello: String
    users: [User]
    grid: [Pixel]
    me: User
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    placePixel(x: Int!, y: Int!, color: String!): Pixel!
  }

  type User { # User type definition
    id: ID!
    username: String!
    email: String!
    role: String
  }

  type Pixel { # Pixel type definition
    id: ID!
    x_coord: Int!
    y_coord: Int!
    color: String!
    user_id: Int
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }
`;

module.exports = typeDefs;