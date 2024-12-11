import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import Auth from '../utils/auth'; // Add this import

const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        username
        email
      }
    }
  }
`;

const LoginForm = () => {
  const [userFormData, setUserFormData] = useState({ email: '', password: '' });
  const [showAlert, setShowAlert] = useState(false);
  const [login] = useMutation(LOGIN_USER);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Logging in with:', userFormData);
      const { data } = await login({
        variables: {
          email: userFormData.email,
          password: userFormData.password
        }
      });

      console.log('Login response:', data);
      if (data.login.token) {
        // Use Auth service instead of directly accessing localStorage
        Auth.login(data.login.token);
        // window.location.assign('/') is handled by Auth.login()
      }
    } catch (err) {
      console.error('Login error:', err);
      setShowAlert(true);
    }
  };

  return (
    <>
      {showAlert && (
        <Alert variant='danger' onClose={() => setShowAlert(false)} dismissible>
          Something went wrong with your login credentials!
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className='mb-3'>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type='email'
            placeholder='Your email'
            value={userFormData.email}
            onChange={(e) => setUserFormData({
              ...userFormData,
              email: e.target.value
            })}
            required
          />
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            value={userFormData.password}
            onChange={(e) => setUserFormData({
              ...userFormData,
              password: e.target.value
            })}
            required
          />
        </Form.Group>

        <Button
          type='submit'
          variant='success'
          disabled={!(userFormData.email && userFormData.password)}
        >
          Submit
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;