import React from 'react';
import { Container, Card, Button, Row, Col, Alert } from 'react-bootstrap';
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
  mutation removeBook($bookId: String!) {
    removeBook(bookId: $bookId) {
      username
      savedBooks {
        bookId
        title
      }
    }
  }
`;

const SavedBooks = () => {
  const { loading, error, data } = useQuery(GET_ME);
  const [removeBook] = useMutation(REMOVE_BOOK);

  // Redirect if not logged in
  if (!Auth.loggedIn()) {
    return <Navigate to="/" />;
  }

  if (loading) return <h2>Loading...</h2>;
  if (error) return <Alert variant="danger">Error loading saved books!</Alert>;

  const userData = data?.me || {};

  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await removeBook({
        variables: { bookId },
        refetchQueries: [{ query: GET_ME }]
      });
    } catch (err) {
      console.error(err);
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
                <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
              )}
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <p className='small'>Authors: {book.authors?.join(', ')}</p>
                <Card.Text>{book.description}</Card.Text>
                <Button
                  className='btn-block btn-danger'
                  onClick={() => handleDeleteBook(book.bookId)}
                >
                  Delete this Book!
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
