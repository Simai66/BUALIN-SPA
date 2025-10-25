import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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
      {/* Services Hero */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(197, 123, 87, 0.9), rgba(90, 108, 87, 0.85))', 
        padding: '4rem 0', 
        color: 'white',
        textAlign: 'center'
      }}>
        <Container>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 600, marginBottom: '1rem' }}>
            Our Services
          </h1>
          <p style={{ fontSize: '1.3rem', maxWidth: '600px', margin: '0 auto' }}>
            Choose the perfect treatment for you from our professional therapists
          </p>
        </Container>
      </div>

      <Container className="my-5">
        {/* Promotions Section */}
        {promotions.length > 0 && (
          <section className="section">
            <h2 className="section-title" style={{ fontSize: '2.5rem' }}>
              🎉 Special Promotions
            </h2>
            <Row className="g-4 mb-5">
              {promotions.map((promo) => (
                <Col md={6} key={promo.id}>
                  <Card 
                    style={{ 
                      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '1rem'
                    }}
                  >
                    <Card.Body>
                      <h4 style={{ color: '#c57b57', fontWeight: 600 }}>{promo.title}</h4>
                      <p style={{ color: '#6b6b6b', marginBottom: '1rem' }}>{promo.description}</p>
                      <Badge 
                        bg="danger" 
                        style={{ 
                          padding: '0.6rem 1.2rem', 
                          fontSize: '1rem',
                          borderRadius: '20px'
                        }}
                      >
                        {promo.discount_type === 'percent'
                          ? `${promo.discount_value}% OFF`
                          : `฿${promo.discount_value} OFF`}
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>
        )}

        {/* Services Section */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <Row className="g-4">
            {services.map((service) => (
              <Col md={6} lg={4} key={service.id}>
                <div className="service-card">
                  <div
                    style={{
                      height: '250px',
                      background: 'linear-gradient(135deg, #c57b57 0%, #5a6c57 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '5rem',
                    }}
                  >
                    💆‍♀️
                  </div>
                  <div className="service-card-body">
                    <h5>{service.name}</h5>
                    <p style={{ color: '#6b6b6b', fontSize: '0.95rem' }}>{service.description}</p>
                    <div className="d-flex justify-content-between align-items-center" style={{ marginTop: '1.5rem' }}>
                      <span style={{ color: '#6b6b6b' }}>
                        ⏱ {service.duration_minutes} mins
                      </span>
                      <span className="service-price">
                        ฿{service.base_price.toLocaleString()}
                      </span>
                    </div>
                    <Button 
                      variant="primary" 
                      className="w-100 mt-3" 
                      onClick={handleBookNow}
                      style={{ padding: '0.8rem', borderRadius: '50px', fontWeight: 500 }}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}

        {!loading && services.length === 0 && (
          <div className="text-center py-5">
            <p style={{ fontSize: '1.2rem', color: '#6b6b6b' }}>No services available at the moment</p>
          </div>
        )}
      </Container>
    </>
  );
};
