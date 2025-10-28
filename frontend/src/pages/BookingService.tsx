import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { servicesAPI } from '../api/client';
import { useBookingStore } from '../store';
import { StepProgress } from '../components/StepProgress';

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
        setError('Unable to load services');
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
      <div className="mb-3">
        <h2 className="section-title">จองบริการ</h2>
        <StepProgress current={1} />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Row>
          {services.map((service) => (
            <Col md={6} lg={4} key={service.id} className="mb-4">
              <Card className="h-100 shadow-sm hover-card">
                <div className="brand-gradient card-visual" aria-hidden>💆</div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{service.name}</Card.Title>
                  <Card.Text className="flex-grow-1">{service.description}</Card.Text>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>⏱ {service.duration_minutes} mins</span>
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
