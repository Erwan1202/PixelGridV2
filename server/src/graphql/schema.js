const { gql } = require('apollo-server-express');

// GraphQL type definitions
const typeDefs = gql`
  type Query { # Root query type
    hello: String
    users: [User]
    grid: [Pixel]
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
`;

module.exports = typeDefs;