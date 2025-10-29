import { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api/client';

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setStatus('error');
  setMessage('Invalid link');
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token, email);
        setStatus('success');
  setMessage(response.data.message || 'Email verified successfully!');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error: unknown) {
        setStatus('error');
        const err = error as { response?: { data?: { message?: string } } };
  setMessage(err.response?.data?.message || 'An error occurred while verifying email');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          {status === 'loading' && (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
  <p className="mt-3">Verifying email...</p>
            </div>
          )}
          {status === 'success' && (
            <Alert variant="success">
  <Alert.Heading>✓ Success!</Alert.Heading>
              <p>{message}</p>
  <p className="mb-0">Redirecting you to the login page...</p>
            </Alert>
          )}
          {status === 'error' && (
            <Alert variant="danger">
  <Alert.Heading>Error</Alert.Heading>
              <p>{message}</p>
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};
