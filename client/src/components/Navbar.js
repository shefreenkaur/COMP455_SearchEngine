import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Modal, Tab } from 'react-bootstrap';
import SignUpForm from './SignupForm';
import LoginForm from './LoginForm';
import Auth from '../utils/auth';
import '../styles/navbar.css';  // Make sure this path is correct

const AppNavbar = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Navbar bg='dark' variant='dark' expand='lg' className="custom-navbar">
        <Container>
          <Navbar.Brand as={Link} to='/' className="brand-text">
            Book Search
          </Navbar.Brand>
          <Navbar.Toggle aria-controls='navbar' />
          <Navbar.Collapse id='navbar'>
            <Nav className='ms-auto nav-links-container'>
              <Nav.Link as={Link} to='/' className="nav-link-custom">
                Search Books
              </Nav.Link>
              {Auth.loggedIn() ? (
                <>
                  <Nav.Link as={Link} to='/saved' className="nav-link-custom">
                    Saved Books
                  </Nav.Link>
                  <Nav.Link onClick={Auth.logout} className="nav-link-logout">
                    Logout
                  </Nav.Link>
                </>
              ) : (
                <Nav.Link 
                  onClick={() => setShowModal(true)} 
                  className="nav-link-login"
                >
                  Login/Sign Up
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal
        size='lg'
        show={showModal}
        onHide={() => setShowModal(false)}
        aria-labelledby='signup-modal'
        className="auth-modal"
      >
        <Tab.Container defaultActiveKey='login'>
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title id='signup-modal' className="modal-title-custom">
              <Nav variant='pills' className="auth-nav-pills">
                <Nav.Item>
                  <Nav.Link eventKey='login'>Login</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey='signup'>Sign Up</Nav.Link>
                </Nav.Item>
              </Nav>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tab.Content>
              <Tab.Pane eventKey='login'>
                <LoginForm handleModalClose={() => setShowModal(false)} />
              </Tab.Pane>
              <Tab.Pane eventKey='signup'>
                <SignUpForm handleModalClose={() => setShowModal(false)} />
              </Tab.Pane>
            </Tab.Content>
          </Modal.Body>
        </Tab.Container>
      </Modal>
    </>
  );
};

export default AppNavbar;