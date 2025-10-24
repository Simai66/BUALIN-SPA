import { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
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
        setMessage('ลิงก์ไม่ถูกต้อง');
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token, email);
        setStatus('success');
        setMessage(response.data.message || 'ยืนยันอีเมลสำเร็จ!');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'เกิดข้อผิดพลาดในการยืนยันอีเมล');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <>
      <Navbar />
      <Container>
        <Row className="justify-content-center mt-5">
          <Col md={6}>
            {status === 'loading' && (
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">กำลังยืนยันอีเมล...</p>
              </div>
            )}
            {status === 'success' && (
              <Alert variant="success">
                <Alert.Heading>✓ สำเร็จ!</Alert.Heading>
                <p>{message}</p>
                <p className="mb-0">กำลังนำคุณไปหน้าเข้าสู่ระบบ...</p>
              </Alert>
            )}
            {status === 'error' && (
              <Alert variant="danger">
                <Alert.Heading>เกิดข้อผิดพลาด</Alert.Heading>
                <p>{message}</p>
              </Alert>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};
