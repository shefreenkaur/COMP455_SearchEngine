const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
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

  type ChatbotResponse {
  response: String!
}
      type Query {
    me: User
    chatbotResponse(message: String!): ChatbotResponse
    searchBooks(
      searchTerm: String!
      filters: SearchFilters
      sort: SortInput
      page: Int
      limit: Int
    ): SearchResult!
  }

  input SaveBookInput {
  bookId: String!
  authors: [String]
  description: String
  title: String!
  image: String
  link: String
}

  input SearchFilters {
    authors: [String]
    categories: [String]
    yearRange: YearRange
  }

  input YearRange {
    start: String
    end: String
  }

  input SortInput {
    field: SortField!
    direction: SortDirection!
  }

  enum SortField {
    TITLE
    PUBLISHED_DATE
  }

  enum SortDirection {
    ASC
    DESC
  }

  

  type SearchResult {
    books: [Book]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    currentPage: Int!
    totalPages: Int!
  }
`;

module.exports = typeDefs;
