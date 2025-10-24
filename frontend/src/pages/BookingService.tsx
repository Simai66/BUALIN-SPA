import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { servicesAPI } from '../api/client';
import { useBookingStore } from '../store';

interface Service {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  base_price: number;
  image_path: string;
}

export const BookingService = () => {
  const navigate = useNavigate();
  const { setService } = useBookingStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await servicesAPI.getAll();
        setServices(response.data.services);
      } catch {
        setError('ไม่สามารถโหลดข้อมูลบริการได้');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleSelectService = (service: Service) => {
    setService(service);
    navigate('/booking/therapist');
  };

  return (
    <Container className="my-5">
      <div className="mb-4">
        <h2>จองบริการ - ขั้นตอนที่ 1/3</h2>
        <p className="text-muted">เลือกบริการที่ต้องการ</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
        </div>
      ) : (
        <Row>
          {services.map((service) => (
            <Col md={6} lg={4} key={service.id} className="mb-4">
              <Card className="h-100 shadow-sm hover-card">
                <div
                  style={{
                    height: '180px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '3.5rem',
                  }}
                >
                  💆
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{service.name}</Card.Title>
                  <Card.Text className="flex-grow-1">{service.description}</Card.Text>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>⏱ {service.duration_minutes} นาที</span>
                      <span className="text-primary fw-bold">
                        ฿{service.base_price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={() => handleSelectService(service)}
                  >
                    เลือกบริการนี้
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};
