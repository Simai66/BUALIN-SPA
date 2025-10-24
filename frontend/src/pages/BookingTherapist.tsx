import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { therapistsAPI } from '../api/client';
import { useBookingStore } from '../store';

interface Therapist {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  is_active: boolean;
}

export const BookingTherapist = () => {
  const navigate = useNavigate();
  const { selectedService, setTherapist } = useBookingStore();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedService) {
      navigate('/booking/service');
      return;
    }

    const fetchTherapists = async () => {
      try {
        const response = await therapistsAPI.getAll();
        setTherapists(response.data.therapists);
      } catch {
        setError('ไม่สามารถโหลดข้อมูลพนักงานได้');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, [selectedService, navigate]);

  const handleSelectTherapist = (therapist: Therapist) => {
    setTherapist(therapist);
    navigate('/booking/datetime');
  };

  const handleBack = () => {
    navigate('/booking/service');
  };

  return (
    <Container className="my-5">
      <div className="mb-4">
        <h2>จองบริการ - ขั้นตอนที่ 2/3</h2>
        <p className="text-muted">เลือกพนักงาน</p>
        {selectedService && (
          <Alert variant="info">
            บริการที่เลือก: <strong>{selectedService.name}</strong> (
            {selectedService.duration_minutes} นาที)
          </Alert>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
        </div>
      ) : (
        <>
          <Row>
            {therapists.map((therapist) => (
              <Col md={6} lg={4} key={therapist.id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <div
                    style={{
                      height: '150px',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '4rem',
                    }}
                  >
                    👩‍⚕️
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{therapist.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {therapist.specialty}
                    </Card.Subtitle>
                    <Card.Text className="flex-grow-1">{therapist.bio}</Card.Text>
                    <Button
                      variant="primary"
                      className="w-100"
                      onClick={() => handleSelectTherapist(therapist)}
                    >
                      เลือกพนักงานคนนี้
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="mt-4">
            <Button variant="secondary" onClick={handleBack}>
              ← ย้อนกลับ
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};
