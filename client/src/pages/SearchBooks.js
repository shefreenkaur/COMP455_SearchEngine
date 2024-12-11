import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useLazyQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import Auth from '../utils/auth';
import '../styles/searchBooks.css';

const SEARCH_BOOKS = gql`
  query searchBooks($searchTerm: String!) {
    searchBooks(searchTerm: $searchTerm) {
      books {
        bookId
        title
        authors
        description
        image
        link
      }
    }
  }
`;

const SAVE_BOOK = gql`
  mutation SaveBook($bookId: String!, $title: String!, $authors: [String], $description: String, $image: String, $link: String) {
    saveBook(book: {
      bookId: $bookId,
      title: $title,
      authors: $authors,
      description: $description,
      image: $image,
      link: $link
    }) {
      _id
      savedBooks {
        bookId
        title
      }
    }
  }
`;

const SearchBooks = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchBooks, { loading, data }] = useLazyQuery(SEARCH_BOOKS);
  const [saveBook] = useMutation(SAVE_BOOK);

  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      await searchBooks({
        variables: { searchTerm: searchInput }
      });
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleSaveBook = async (book) => {
    try {
      const { data } = await saveBook({
        variables: {
          bookId: book.bookId,
          title: book.title,
          authors: book.authors,
          description: book.description,
          image: book.image,
          link: book.link
        }
      });
      console.log('Book saved:', data);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    setChatMessages(prev => [...prev, { text: chatInput, sender: 'user' }]);
    
    try {
        const response = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: chatInput })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // Add typing effect
        setChatMessages(prev => [...prev, {
            text: "Thinking...",
            sender: 'bot',
            isTyping: true
        }]);

        // Remove typing message and add actual response after a delay
        setTimeout(() => {
            setChatMessages(prev => {
                const newMessages = prev.filter(msg => !msg.isTyping);
                return [...newMessages, {
                    text: data.response,
                    sender: 'bot'
                }];
            });
        }, 1000);

    } catch (error) {
        console.error('Chat error:', error);
        setChatMessages(prev => [...prev, {
            text: "Sorry, I'm having trouble connecting. Please try again.",
            sender: 'bot'
        }]);
    }

    setChatInput('');
};

const ChatBox = () => (
  <div className="chat-container">
      <div className="chat-header" onClick={() => setShowChat(!showChat)}>
          <h5>Book Assistant</h5>
          <span className={showChat ? 'minimize' : 'expand'}>
              {showChat ? '−' : '+'}
          </span>
      </div>

      {showChat && (
          <>
              <div className="chat-messages">
                  {chatMessages.map((msg, index) => (
                      <div 
                          key={index} 
                          className={`message ${msg.sender} ${msg.isTyping ? 'typing' : ''}`}
                      >
                          {msg.text}
                      </div>
                  ))}
              </div>

              <div className="chat-input">
                  <form onSubmit={handleChatSubmit}>
                      <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask for book recommendations..."
                          className="chat-input-field"
                          autoFocus
                      />
                      <button type="submit" className="chat-send-button">
                          Send
                      </button>
                  </form>
              </div>
          </>
      )}
  </div>
);

  return (
    <>
      <div className="search-hero">
        <Container>
          <h1>Discover Your Next Book</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <div className="search-input-wrapper">
                  <Form.Control
                    name='searchInput'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    type='text'
                    placeholder='Search by title, author, or keyword...'
                  />
                  <Button type='submit' className="search-button">
                    Search
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container className="book-grid">
        <h2>
          {loading 
            ? 'Loading...' 
            : data?.searchBooks.books?.length 
              ? `Viewing ${data.searchBooks.books.length} results:` 
              : 'Which book is on your mind today?'}
        </h2>
        <Row>
          {data?.searchBooks.books?.map((book) => (
            <Col md={4} lg={3} key={book.bookId}>
              <div className="book-card">
                {book.image && (
                  <img 
                    src={book.image} 
                    alt={`Cover for ${book.title}`} 
                    className="book-image"
                  />
                )}
               <div className="book-info">
						<h3 className="book-title">{book.title}</h3>
						<p className="book-authors">By: {book.authors?.join(', ')}</p>
						<p className="book-description">{book.description}</p>
						{Auth.loggedIn() && (
							<Button
								className="save-button"
								onClick={() => handleSaveBook(book)}
							>
								Save
							</Button>
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
      <ChatBox />
    </>
  );
};
export default SearchBooks;