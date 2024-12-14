import React, { useState } from 'react';
import { Container, Card, Button, Row, Col, Alert, Form } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Navigate } from 'react-router-dom';
import Auth from '../utils/auth.js';

const GET_ME = gql`
  query me {
    me {
      username
      savedBooks {
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
const REMOVE_BOOK = gql`
  mutation removeBook($bookId: String!) {  # Changed from ID! to String!
    removeBook(bookId: $bookId) {
      _id
      username
      savedBooks {
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
const ADD_NOTE = gql`
  mutation AddBookNote($bookId: String!, $note: NoteInput!) {
    addBookNote(bookId: $bookId, note: { content: $note }) {
      savedBooks {
        bookId
        title
        notes {
          content
          createdAt
        }
      }
    }
  }
`;

const SavedBooks = () => {
  const [addNote] = useMutation(ADD_NOTE);
  const { loading, error, data, refetch } = useQuery(GET_ME);
  const [removeBook, { error: removeError }] = useMutation(REMOVE_BOOK,
     {
    
    // Optimistically update the cache
    update(cache, { data: { removeBook } }) {
      cache.modify({
        fields: {
          me(existingMe) {
            // Create a new savedBooks array without the deleted book
            const newSavedBooks = existingMe.savedBooks.filter(
              book => book.bookId !== removeBook.bookId
            );

            return {
              ...existingMe,
              savedBooks: newSavedBooks
            };
          }
        }
      });
    },
    onError: (error) => {
      console.error('Error removing book:', error);
    }
  });
  const [noteInput, setNoteInput] = useState({});
  const [activeBookId, setActiveBookId] = useState(null);
  const handleAddNote = async (e, bookId) => {
    e.preventDefault();
    const noteContent = noteInput[bookId];
    if (!noteContent?.trim()) return;
  
    try {
      await addNote({
        variables: {
          bookId,
          note: { content: noteContent }
        },
        refetchQueries: [{ query: GET_ME }]
      });
      // Clear only this book's note input
      setNoteInput({
        ...noteInput,
        [bookId]: ''
      });
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  // Redirect if not logged in
  if (!Auth.loggedIn()) {
    return <Navigate to="/" />;
  }

  if (loading) return <h2>Loading...</h2>;
  if (error) return <Alert variant="danger">Error loading saved books!</Alert>;

  const userData = data?.me || {};

  const handleDeleteBook = async (bookId) => {
    try {
      const { data } = await removeBook({
        variables: { bookId },
        update(cache) {
          const existingMe = cache.readQuery({ query: GET_ME });
          const updatedBooks = existingMe.me.savedBooks.filter(
            (book) => book.bookId !== bookId
          );
          cache.writeQuery({
            query: GET_ME,
            data: { me: { ...existingMe.me, savedBooks: updatedBooks } },
          });
        },
      });
      console.log('Book removed successfully:', data);
    } catch (err) {
      console.error('Error removing book:', err);
    }
  };


  return (
    <Container>
      <h2>
        {userData.savedBooks?.length
          ? `Viewing ${userData.savedBooks.length} saved ${
              userData.savedBooks.length === 1 ? 'book' : 'books'
            }:`
          : 'You have no saved books!'}
      </h2>
      <Row>
        {userData.savedBooks?.map((book) => (
          <Col md="4" key={book.bookId}>
            <Card border='dark'>
              {book.image && (
                <Card.Img 
                  src={book.image} 
                  alt={`The cover for ${book.title}`} 
                  variant='top' 
                />
              )}
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <p className='small'>Authors: {book.authors?.join(', ')}</p>
                <Card.Text>{book.description}</Card.Text>
                
                <div className="notes-section">
        <Form onSubmit={(e) => handleAddNote(e, book.bookId)}>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Add a note about this book..."
              value={noteInput[book.bookId] || ''}
              onChange={(e) => setNoteInput({
                ...noteInput,
                [book.bookId]: e.target.value
              })}
            />
          </Form.Group>
          <Button 
            type="submit" 
            variant="outline-primary" 
            size="sm" 
            className="mt-2"
          >
            Add Note
          </Button>
        </Form>
                  
                  {/* Display Notes */}
                  <div className="notes-list mt-3">
                    {book.notes?.map((note, index) => (
                      <div key={index} className="note-item p-2 mb-2 bg-light rounded">
                        <p className="mb-1">{note.content}</p>
                        <small className="text-muted">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className='btn-block btn-danger mt-3'
                  onClick={() => handleDeleteBook(book.bookId)}
                >
                  Delete Book
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SavedBooks;
