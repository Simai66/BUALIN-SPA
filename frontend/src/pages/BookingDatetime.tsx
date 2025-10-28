import { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Button, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../api/client';
import { useBookingStore } from '../store';
import { TimeBlockGrid } from '../components/TimeBlockGrid';
import { StepProgress } from '../components/StepProgress';

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export const BookingDatetime = () => {
  const navigate = useNavigate();
  const { selectedService, selectedTherapist, setDatetime } = useBookingStore();
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hourlyOnly, setHourlyOnly] = useState(true);

  useEffect(() => {
    if (!selectedService || !selectedTherapist) {
      navigate('/booking/service');
      return;
    }

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, [selectedService, selectedTherapist, navigate]);

  const fetchSlots = useCallback(async () => {
    if (!selectedDate || !selectedService || !selectedTherapist) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await bookingsAPI.getSlots({
        service_id: selectedService.id,
        therapist_id: selectedTherapist.id,
        date: selectedDate,
      });
      setSlots(response.data.slots);
    } catch {
      setError('Unable to load available time slots');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedService, selectedTherapist]);

  useEffect(() => {
    if (selectedDate && selectedService && selectedTherapist) {
      fetchSlots();
    }
  }, [selectedDate, selectedService, selectedTherapist, fetchSlots]);

  const handleSelectSlot = (slot: TimeSlot) => {
    setDatetime(new Date(slot.start));
    navigate('/booking/confirm');
  };

  const handleBack = () => {
    navigate('/booking/therapist');
  };

  const handleSelectEarliest = () => {
    if (!slots || slots.length === 0) return;
    const earliest = slots.find((s) => s.available) || slots[0];
    if (earliest) {
      handleSelectSlot(earliest);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);

  return (
    <Container className="my-5">
      <div className="mb-3">
        <h2 className="section-title">วันและเวลา</h2>
        <StepProgress current={3} />
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <Alert variant="light" className="alert-brand">
            <strong>บริการ:</strong> {selectedService?.name}<br />
            <strong>พนักงาน:</strong> {selectedTherapist?.name}<br />
            <strong>ระยะเวลา:</strong> {selectedService?.duration_minutes} นาที
          </Alert>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>เลือกวันที่</Form.Label>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate.toISOString().split('T')[0]}
              max={maxDate.toISOString().split('T')[0]}
            />
            <Form.Text className="text-muted">
              You can book 1-30 days in advance
            </Form.Text>
          </Form.Group>
          <Form.Check
            type="switch"
            id="hourly-only-switch"
            className="mt-3"
            label="แสดงเฉพาะรายชั่วโมง"
            checked={hourlyOnly}
            onChange={(e) => setHourlyOnly(e.target.checked)}
          />
          <div className="mt-3 d-flex">
            <Button variant="primary" onClick={handleSelectEarliest} disabled={loading || slots.length === 0}>
              เลือกเวลาที่เร็วที่สุด
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {slots.length > 0 ? (
            <TimeBlockGrid
              slots={slots}
              onSelectSlot={handleSelectSlot}
              durationMinutes={selectedService?.duration_minutes || 60}
              hourlyOnly={hourlyOnly}
            />
          ) : (
            <Alert variant="warning">
              No available time slots for the selected date. Please choose another date
            </Alert>
          )}

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
