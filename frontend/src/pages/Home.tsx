import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Relax, Unwind<br/>Find Your Serenity</h1>
          <p className="hero-subtitle">
            Thai Spa is a sanctuary of tranquility where you'll learn to listen to your body<br/>
            and nurture it with professional massage and spa treatments.
          </p>
          <button className="hero-btn" onClick={() => navigate('/services')}>
            Explore Our Services
          </button>
        </div>
      </section>

      {/* Welcome Text Section */}
      <section className="section">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} className="text-center">
              <h2 className="section-title">Sometimes, Life Gets Too Busy</h2>
              <p className="section-subtitle">
                We're here to help you slow down and find your balance
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="section" style={{ backgroundColor: '#faf8f6' }}>
        <Container>
          <Row className="g-4">
            <Col md={4}>
              <div className="feature-card">
                <div className="feature-icon">💆</div>
                <h3>Diverse Services</h3>
                <p>
                  Traditional Thai Massage, Aromatherapy,<br/>
                  Hot Stone Massage, and many more spa services
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-card">
                <div className="feature-icon">🌿</div>
                <h3>Professional Experts</h3>
                <p>
                  Certified therapists team<br/>
                  with over 10 years of experience
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-card">
                <div className="feature-icon">�️</div>
                <h3>Tranquil Atmosphere</h3>
                <p>
                  Space designed for relaxation<br/>
                  to help you experience inner peace
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      
    </>
  );
};
