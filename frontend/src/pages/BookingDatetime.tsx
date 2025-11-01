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
  const [availableDates, setAvailableDates] = useState<{ date: string; availableCount: number; hasSchedule?: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hourlyOnly, setHourlyOnly] = useState(false);

  const formatYMDLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    if (!selectedService || !selectedTherapist) {
      navigate('/booking/service');
      return;
    }

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(formatYMDLocal(tomorrow));
  }, [selectedService, selectedTherapist, navigate]);

  // Fetch available dates list
  const fetchAvailableDates = useCallback(async () => {
    if (!selectedService || !selectedTherapist) return;
    try {
      const res = await bookingsAPI.getAvailableDates({
        service_id: selectedService.id,
        therapist_id: selectedTherapist.id,
      });
      const dates = res.data.dates || [];
      setAvailableDates(dates);

      // If current selected date has 0 availability, auto-suggest earliest available
      const current = dates.find((d: any) => d.date === selectedDate);
      const earliest = dates.find((d: any) => d.availableCount > 0);
      if (current && current.availableCount === 0 && earliest) {
        setSelectedDate(earliest.date);
      }
    } catch (e) {
      // ignore silently to avoid blocking slot load
    }
  }, [selectedService, selectedTherapist, selectedDate]);

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
    if (selectedService && selectedTherapist) {
      fetchAvailableDates();
    }
    if (selectedDate && selectedService && selectedTherapist) {
      fetchSlots();
    }
  }, [selectedDate, selectedService, selectedTherapist, fetchSlots, fetchAvailableDates]);

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
  maxDate.setDate(maxDate.getDate() + 14);

  return (
    <Container className="my-5">
      <div className="mb-3">
  <h2 className="section-title">Date & Time</h2>
        <StepProgress current={3} />
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <Alert variant="light" className="alert-brand">
  <strong>Service:</strong> {selectedService?.name}<br />
  <strong>Therapist:</strong> {selectedTherapist?.name}<br />
  <strong>Duration:</strong> {selectedService?.duration_minutes} minutes
          </Alert>
        </Col>
        <Col md={6}>
          <Form.Group>
  <Form.Label>Select Date</Form.Label>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={formatYMDLocal(minDate)}
              max={formatYMDLocal(maxDate)}
            />
            <Form.Text className="text-muted">
              You can book 1–14 days ahead
            </Form.Text>
          </Form.Group>
          <Form.Check
            type="switch"
            id="hourly-only-switch"
            className="mt-3"
  label="Show hourly only"
            checked={hourlyOnly}
            onChange={(e) => setHourlyOnly(e.target.checked)}
          />
          <div className="mt-3 d-flex">
            <Button variant="primary" onClick={handleSelectEarliest} disabled={loading || slots.length === 0}>
  Select Earliest Time
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
              No available time slots for the selected date.
              {availableDates.length > 0 && (
                <>
                  {' '}Try {availableDates.find((d) => d.availableCount > 0)?.date || 'another date'} or choose from the list below.
                </>
              )}
            </Alert>
          )}

          {/* Available dates list */}
          {availableDates.length > 0 && (
            <div className="mt-3">
              <div className="mb-2 fw-bold">Dates with availability</div>
              <div className="d-flex flex-wrap gap-2">
                {availableDates.map((d) => (
                  <Button
                    key={d.date}
                    variant={d.availableCount > 0 ? (d.date === selectedDate ? 'primary' : 'outline-primary') : 'outline-secondary'}
                    size="sm"
                    disabled={d.availableCount === 0}
                    onClick={() => setSelectedDate(d.date)}
                  >
                    {d.date} {d.availableCount > 0 ? `(${d.availableCount})` : (d.hasSchedule ? '(Full)' : '(Closed)')}
                  </Button>
                ))}
              </div>
              {/* Near-full warning */}
              {(() => {
                const current = availableDates.find((d) => d.date === selectedDate);
                if (current && current.availableCount > 0 && current.availableCount <= 2) {
                  return (
                    <Alert className="mt-2" variant="info">Slots nearly full on {selectedDate}. Please book soon.</Alert>
                  );
                }
                return null;
              })()}
            </div>
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
