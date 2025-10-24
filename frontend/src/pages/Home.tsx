import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <Container>
        <Row className="my-5">
          <Col md={12} className="text-center">
            <h1>🌸 ยินดีต้อนรับสู่ไทยสปา</h1>
            <p className="lead">ผ่อนคลายกายและใจ ด้วยบริการนวดและสปาคุณภาพ</p>
            <Button 
              variant="primary" 
              size="lg" 
              className="mt-3"
              onClick={() => navigate('/services')}
            >
              เริ่มจองบริการ
            </Button>
          </Col>
        </Row>

        <Row className="my-5">
          <Col md={4}>
            <Card className="h-100 text-center">
              <Card.Body>
                <div className="display-4">💆</div>
                <Card.Title>บริการหลากหลาย</Card.Title>
                <Card.Text>
                  นวดแผนไทย อโรม่า หินร้อน และอื่นๆ อีกมากมาย
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 text-center">
              <Card.Body>
                <div className="display-4">👩‍⚕️</div>
                <Card.Title>ช่างมืออาชีพ</Card.Title>
                <Card.Text>
                  ทีมงานที่มีประสบการณ์และได้รับการรับรองมาตรฐาน
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 text-center">
              <Card.Body>
                <div className="display-4">📱</div>
                <Card.Title>จองง่าย สะดวก</Card.Title>
                <Card.Text>
                  จองออนไลน์ได้ทุกที่ทุกเวลา พร้อมยืนยันทันที
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="my-5">
          <Col md={12}>
            <Card bg="light">
              <Card.Body>
                <h3>เกี่ยวกับเรา</h3>
                <p>
                  ไทยสปา เป็นสปาและนวดที่มีชื่อเสียง ให้บริการมามากกว่า 10 ปี 
                  ด้วยทีมงานมืออาชีพและบรรยากาศที่ผ่อนคลาย 
                  เรามุ่งมั่นที่จะมอบประสบการณ์การดูแลสุขภาพและความงามที่ดีที่สุดให้กับลูกค้าทุกท่าน
                </p>
                <p>
                  <strong>เปิดให้บริการ:</strong> วันจันทร์ - วันอาทิตย์ เวลา 09:00 - 18:00 น.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};
