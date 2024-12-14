// route to get logged in user's info (needs the token)
export const getMe = (token) => {
  return fetch('/api/users/me', {
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
  });
};

export const createUser = (userData) => {
  return fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
};

export const loginUser = (userData) => {
  return fetch('/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
};

// save book data for a logged in user
// export const saveBook = (bookData, token) => {
//   return fetch('/api/users', {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(bookData),
//   });
// };

// // remove saved book data for a logged in user
// export const deleteBook = (bookId, token) => {
//   return fetch(`/api/users/books/${bookId}`, {
//     method: 'DELETE',
//     headers: {
//       authorization: `Bearer ${token}`,
//     },
//   });
// };

export const searchBooks = async (query, page = 1, limit = 10) => {
  const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
  
  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    // Transform OpenLibrary data
    const books = data.docs.map(book => ({
      bookId: book.key,
      title: book.title,
      authors: book.author_name || [],
      description: book.description || '',
      image: book.cover_i 
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` 
        : '',
      link: `https://openlibrary.org${book.key}`
    }));

    return {
      books,
      totalCount: data.numFound,
      pageInfo: {
        hasNextPage: page * limit < data.numFound,
        currentPage: page,
        totalPages: Math.ceil(data.numFound / limit)
      }
    };
  } catch (error) {
    console.error('OpenLibrary search error:', error);
    throw new Error('Failed to search books');
  }
};
