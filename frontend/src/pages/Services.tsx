import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { servicesAPI, promotionsAPI } from '../api/client';
import { useAuthStore } from '../store';

interface Service {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  base_price: number;
  image_path: string;
  is_active: boolean;
}

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number;
  start_date: string;
  end_date: string;
}

export const Services = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [services, setServices] = useState<Service[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, promotionsRes] = await Promise.all([
          servicesAPI.getAll(),
          promotionsAPI.getAll(),
        ]);
        setServices(servicesRes.data.services);
        setPromotions(promotionsRes.data.promotions);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/booking/service');
    }
  };

  return (
    <>
      <Navbar />
      <Container className="my-5">
        <h1 className="text-center mb-4">บริการของเรา</h1>

        {/* Promotions Section */}
        {promotions.length > 0 && (
          <Row className="mb-5">
            <Col md={12}>
              <h3 className="mb-3">🎉 โปรโมชันพิเศษ</h3>
              {promotions.map((promo) => (
                <Card key={promo.id} className="mb-3" bg="warning" text="dark">
                  <Card.Body>
                    <Card.Title>{promo.title}</Card.Title>
                    <Card.Text>{promo.description}</Card.Text>
                    <Badge bg="danger">
                      {promo.discount_type === 'percent'
                        ? `ลด ${promo.discount_value}%`
                        : `ลด ${promo.discount_value} บาท`}
                    </Badge>
                  </Card.Body>
                </Card>
              ))}
            </Col>
          </Row>
        )}

        {/* Services Section */}
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
                <Card className="h-100 shadow-sm">
                  <div
                    style={{
                      height: '200px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '4rem',
                    }}
                  >
                    💆
                  </div>
                  <Card.Body>
                    <Card.Title>{service.name}</Card.Title>
                    <Card.Text>{service.description}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span>
                        <strong>⏱ {service.duration_minutes} นาที</strong>
                      </span>
                      <span className="text-primary fs-5">
                        <strong>฿{service.base_price.toLocaleString()}</strong>
                      </span>
                    </div>
                    <Button variant="primary" className="w-100" onClick={handleBookNow}>
                      จองเลย
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {!loading && services.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">ไม่พบบริการในขณะนี้</p>
          </div>
        )}
      </Container>
    </>
  );
};
