import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { therapistsAPI } from '../api/client';
import { useBookingStore } from '../store';
import { StepProgress } from '../components/StepProgress';

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
        setError('Unable to load therapist data');
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

  const handleAutoAssign = () => {
    if (!therapists || therapists.length === 0) {
      setError('ยังไม่มีพนักงานพร้อมให้บริการในขณะนี้');
      return;
    }
    const activeList = therapists.filter((t) => (t as any).is_active !== false);
    const selected = activeList[0] || therapists[0];
    setTherapist(selected);
    navigate('/booking/datetime');
  };

  const handleBack = () => {
    navigate('/booking/service');
  };

  return (
    <Container className="my-5">
      <div className="mb-3">
        <h2 className="section-title">เลือกพนักงาน</h2>
        <StepProgress current={2} />
        {selectedService && (
          <Alert variant="light" className="alert-brand">
            บริการที่เลือก: <strong>{selectedService.name}</strong> (
            {selectedService.duration_minutes} นาที)
          </Alert>
        )}
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={handleAutoAssign}>
            เลือกให้อัตโนมัติ (เร็วที่สุด)
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <Row>
            {therapists.map((therapist) => (
              <Col md={6} lg={4} key={therapist.id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <div className="brand-gradient card-visual" aria-hidden>👩‍⚕️</div>
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
                      เลือกพนักงานนี้
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="mt-4">
            <Button variant="secondary" onClick={handleBack}>
              ← Back
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};
