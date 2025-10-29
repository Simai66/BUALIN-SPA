import { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Alert, ListGroup, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../api/client';
import { useBookingStore } from '../store';
import { StepProgress } from '../components/StepProgress';

export const BookingConfirm = () => {
  const navigate = useNavigate();
  const { selectedService, selectedTherapist, selectedDatetime, reset } = useBookingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [reference, setReference] = useState<string | null>(null);
  // Avoid navigating during render; redirect via effect if prerequisites missing
  const missingPrereq = !selectedService || !selectedTherapist || !selectedDatetime;
  useEffect(() => {
    if (missingPrereq) {
      navigate('/booking/service', { replace: true });
    }
  }, [missingPrereq, navigate]);
  if (missingPrereq) {
    return null;
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sanitizePhone = (value: string) => value.replace(/[^0-9]/g, '').slice(0, 10);
  const isPhoneValid = phone.trim().length === 10 && /^\d{10}$/.test(phone.trim());

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookingsAPI.create({
        service_id: selectedService.id,
        therapist_id: selectedTherapist.id,
        booking_datetime: selectedDatetime.toISOString(),
        customer_phone: phone.trim(),
        customer_name: name.trim() || undefined,
      });
      setReference(response.data?.reference || `BK-${response.data?.bookingId ?? ''}`);
      setShowModal(true);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'An error occurred while booking the service');
      } else {
        setError('An error occurred while booking the service');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    reset();
    navigate('/');
  };

  const handleBack = () => {
    navigate('/booking/datetime');
  };

  return (
    <Container className="my-5">
      <div className="mb-3">
  <h2 className="section-title">Confirm Booking</h2>
        <StepProgress current={4} />
  <p className="text-muted">Please review the details before confirming your booking</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
  <h5 className="mb-0">Booking Details</h5>
        </Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Row>
  <Col sm={4} className="fw-bold">Service:</Col>
                <Col sm={8}>{selectedService.name}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
  <Col sm={4} className="fw-bold">Description:</Col>
                <Col sm={8}>{selectedService.description}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
  <Col sm={4} className="fw-bold">Duration:</Col>
  <Col sm={8}>{selectedService.duration_minutes} minutes</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
  <Col sm={4} className="fw-bold">Therapist:</Col>
                <Col sm={8}>{selectedTherapist.name}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
  <Col sm={4} className="fw-bold">Date &amp; Time:</Col>
                <Col sm={8}>{formatDateTime(selectedDatetime)}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
  <Col sm={4} className="fw-bold">Price:</Col>
                <Col sm={8} className="text-success fw-bold fs-5">
                  ฿{selectedService.base_price?.toLocaleString()}
                </Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
  <Col sm={4} className="fw-bold">Contact Phone:</Col>
                <Col sm={8}>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(sanitizePhone(e.target.value))}
  placeholder="e.g., 08XXXXXXXX"
                  />
                  {!isPhoneValid && phone.length > 0 && (
  <small className="text-danger">Please enter a 10-digit numeric phone number</small>
                  )}
                </Col>
              </Row>
  <small className="text-muted">Use your phone number to confirm without logging in</small>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
  <Col sm={4} className="fw-bold">Customer Name (optional):</Col>
                <Col sm={8}>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
  placeholder="e.g., Somchai Jaidee"
                  />
                </Col>
              </Row>
  <small className="text-muted">If left blank, the system will use "Customer" as the name</small>
            </ListGroup.Item>
          </ListGroup>

          <Alert variant="info" className="mt-3 mb-0">
            <strong>Note:</strong> Final price will be calculated based on available promotions
            and will be shown in the confirmation email sent to you.
          </Alert>
        </Card.Body>
      </Card>

      <div className="mt-4 d-flex justify-content-between">
        <Button variant="secondary" onClick={handleBack} disabled={loading}>
          ← Back
        </Button>
        <Button
          variant="success"
          onClick={handleConfirm}
          disabled={loading || phone.trim().length < 8}
          size="lg"
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Processing...
            </>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </div>

      {/* Success Modal */}
      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Booking Successful!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              fill="currentColor"
              className="bi bi-check-circle-fill text-success"
              viewBox="0 0 16 16"
            >
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
            </svg>
          </div>
          <h5>Your booking has been confirmed</h5>
          <p className="text-muted mb-0">
            A confirmation email has been sent to your email address
            <br />
            Please check your email for booking details
          </p>
          {reference && (
            <div className="mt-3">
              <strong>Booking Reference:</strong> <code>{reference}</code>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleModalClose}>
  Back to Home
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
