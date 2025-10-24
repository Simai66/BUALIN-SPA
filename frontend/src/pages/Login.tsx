import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/client';
import { useAuthStore } from '../store';

export const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      setUser(response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={5}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">เข้าสู่ระบบ</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>อีเมล</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>รหัสผ่าน</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </Button>
              </Form>
              <div className="text-center mt-3">
                ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
