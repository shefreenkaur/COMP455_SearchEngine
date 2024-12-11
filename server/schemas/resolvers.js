const { AuthenticationError, ApolloError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');
const axios = require('axios');

const resolvers = {
  Query: {
    // Keep existing me query
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findOne(
          { _id: context.user._id },
          { __v: 0, password: 0 }
        );
      }
      throw new AuthenticationError('You need to log in...');
    },

    chatbotResponse: async (_, { message }) => {
      try {
        const bookQuery = message.toLowerCase();
        let response;

        // Get book data from your current API
        const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(bookQuery)}`;
        const bookData = await axios.get(searchUrl);

        // Generate a response based on the data
        if (bookData.data.docs.length > 0) {
          const book = bookData.data.docs[0];
          response = `I found "${book.title}" by ${book.author_name?.[0] || 'unknown author'}. 
                     Would you like to know more about it?`;
        } else {
          response = "I couldn't find any books matching your query. Can you try rephrasing?";
        }

        return { response };
      } catch (error) {
        console.error('Chatbot error:', error);
        throw new ApolloError('Failed to get chatbot response');
      }
  },

    // Add new searchBooks query
    searchBooks: async (_, { searchTerm, filters, sort, page = 1, limit = 10 }) => {
      try {
        // Construct OpenLibrary API URL
        const baseUrl = 'https://openlibrary.org/search.json';
        const queryParams = new URLSearchParams({
          q: searchTerm,
          page,
          limit
        });

        if (filters?.authors) {
          queryParams.append('author', filters.authors.join(','));
        }
        if (filters?.categories) {
          queryParams.append('subject', filters.categories.join(','));
        }

        const response = await axios.get(`${baseUrl}?${queryParams}`);
        const { docs, numFound } = response.data;

        // Transform OpenLibrary data
        const books = docs.map(book => ({
          bookId: book.key,
          title: book.title,
          authors: book.author_name || [],
          description: book.description || '',
          image: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : '',
          link: `https://openlibrary.org${book.key}`
        }));

        // Handle sorting
        if (sort) {
          books.sort((a, b) => {
            const direction = sort.direction === 'ASC' ? 1 : -1;
            return direction * a.title.localeCompare(b.title);
          });
        }

        return {
          books,
          totalCount: numFound,
          pageInfo: {
            hasNextPage: page * limit < numFound,
            currentPage: page,
            totalPages: Math.ceil(numFound / limit)
          }
        };
      } catch (error) {
        console.error('OpenLibrary search error:', error);
        throw new ApolloError('Failed to search books');
      }
    }
  },
/*** MUTATIONS */
  Mutation: {
    // Create a new user
    addUser: async (parent, args) => {
        const user = await User.create(args);

        //* console.log(user);
        const token = signToken(user);
        
        //* console.log({input});
        return { token, user };
    },

    // Logs in a user
    login: async (parent, args) => {
      try {
        const { username, email, password } = args;
        const user = await User.findOne({ $or: [{ username }, { email }] });

        if (!user) {
          throw new Error("User not found");
        }

        const correctPass = await user.isCorrectPassword(password);

        if (!correctPass) {
          throw new Error('Incorrect password');
        }

        const token = signToken(user);

        return { token, user };
      } catch (err) {
        throw new Error(err.message);
      }
    },


    // Saves book to a user's `savedBooks`
    saveBook: async (parent, { book }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }
      try {
        return await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: book } },
          { new: true }
        );
      } catch (err) {
        console.error(err);
        throw new Error('Failed to save book');
      }
    },
    // Deletes book from a user's `savedBooks`
    removeBook: async (parent, args, context) => {
      // TDO: Implement book removal logic
      const { bookId } = args;
      const { user } = context;
    
      try {
        // Find the logged-in user based on the context
        const foundUser = await User.findById(user._id);
  
        if (!foundUser) {
          throw new AuthenticationError('User not found');
        }
    
        foundUser.savedBooks = foundUser.savedBooks.filter(
          (book) => book.bookId !== bookId
        );
    
        await foundUser.save();
    
        return foundUser;
      } catch (err) {
        throw new ApolloError('Failed to remove book', 'INTERNAL_SERVER_ERROR');
      }
    }


  },
};

module.exports = resolvers;
