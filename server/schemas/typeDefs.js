const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    username: String
    email: String
    bookCount: Int
    savedBooks: [Book]
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(book: SaveBookInput!): User
    removeBook(bookId: String!): User
  }

  # type User {
  #   _id: ID!
  #   username: String!
  #   email: String!
  #   password: String!
  #   bookCount: Int
  #   savedBooks: [Book]
  # }

  type User {
  username: String!
  email: String!
  password: String!
  savedBooks: [Book]
  bookCount: Int
}

input CreateUserInput {
  username: String!
  email: String!
  password: String!
}

input LoginInput {
  email: String!
  password: String!
}

type Book {
    bookId: String!
    authors: [String]
    description: String
    title: String!
    image: String
    link: String
  }

  type Auth {
    token: ID!
    user: User
  }
      type Query {
    me: User
  }

  input SaveBookInput {
    authors: [String]
    description: String
    title: String
    bookId: ID
    image: String
    link: String
  }
`;

module.exports = typeDefs;
