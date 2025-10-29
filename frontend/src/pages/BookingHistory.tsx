import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { bookingsAPI } from '../api/client';

interface Booking {
  id: number;
  customer_phone: string;
  booking_datetime: string;
  status: string;
  price_at_booking: number;
  service_name: string;
  therapist_name: string;
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'done' | 'cancelled';
type TimeFilter = 'all' | 'upcoming' | 'past';

const BookingHistory: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const handleSearch = async () => {
    const trimmed = phone.trim();
    if (!trimmed) {
  setError('Please enter a phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await bookingsAPI.lookupByPhone(trimmed);
      const data = Array.isArray(response.data) ? response.data : response.data?.bookings || [];
      setBookings(data);
    } catch (err: any) {
  setError(err.response?.data?.message || 'An error occurred while searching');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const statusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'done':
        return 'primary';
      case 'cancelled':
        return 'secondary';
      default:
        return 'light';
    }
  };

  const statusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
  return 'Pending';
      case 'confirmed':
  return 'Confirmed';
      case 'done':
  return 'Completed';
      case 'cancelled':
  return 'Cancelled';
      default:
        return status;
    }
  };

  const isUpcoming = (iso: string) => new Date(iso) > new Date();

  // Sort newest first
  const sorted = [...bookings].sort((a, b) => new Date(b.booking_datetime).getTime() - new Date(a.booking_datetime).getTime());

  const upcomingCount = sorted.filter((b) => isUpcoming(b.booking_datetime)).length;
  const pastCount = sorted.length - upcomingCount;
  const confirmedCount = sorted.filter((b) => b.status.toLowerCase() === 'confirmed').length;
  const cancelledCount = sorted.filter((b) => b.status.toLowerCase() === 'cancelled').length;

  const filtered = sorted.filter((bk) => {
    if (statusFilter !== 'all' && bk.status.toLowerCase() !== statusFilter) return false;
    if (timeFilter === 'upcoming' && !isUpcoming(bk.booking_datetime)) return false;
    if (timeFilter === 'past' && isUpcoming(bk.booking_datetime)) return false;
    return true;
  });

  return (
    <Container className="my-5">
      <div className="mb-3">
  <h2 className="section-title">Booking History</h2>
  <p className="text-muted">Search using the phone number used to book</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm mb-4 card-soft">
        <Card.Body>
          <div className="d-flex gap-2 flex-wrap align-items-end">
            <Form.Control
              type="tel"
  placeholder="Enter phone, e.g., 0812345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ maxWidth: 320 }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} className="btn-action-terra" disabled={loading}>
  {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {sorted.length > 0 && (
        <Card className="shadow-sm mb-4 card-soft">
          <Card.Body>
            <Row>
              <Col>
                <div className="d-flex flex-wrap gap-3 align-items-center">
  <Badge className="badge-terra badge-terra-green">Upcoming {upcomingCount}</Badge>
  <Badge className="badge-terra badge-terra-brown">Confirmed {confirmedCount}</Badge>
  <Badge className="badge-terra badge-terra-brown">Cancelled {cancelledCount}</Badge>
                </div>
              </Col>
            </Row>

            <div className="card-divider mt-3 pt-3">
              <details>
                <summary className="small text-muted" style={{ cursor: 'pointer' }}>
  Additional Filters
                </summary>
                <Row className="g-3 mt-2">
                  <Col md={6}>
  <div className="mb-2 text-muted small">Filter by status</div>
                    <div className="d-flex flex-wrap gap-2">
                      {[
  { value: 'pending', label: 'Pending', count: sorted.filter(b => b.status.toLowerCase() === 'pending').length },
  { value: 'done', label: 'Completed', count: sorted.filter(b => b.status.toLowerCase() === 'done').length },
  { value: 'cancelled', label: 'Cancelled', count: cancelledCount },
                      ].map(({ value, label, count }) => (
                        <Button
                          key={value}
                          size="sm"
                           variant={statusFilter === value ? 'outline-dark' : 'outline-secondary'}
                          style={{ fontSize: '0.95rem', fontWeight: 600 }}
                          onClick={() => setStatusFilter(value as StatusFilter)}
                        >
                          {label} ({count})
                        </Button>
                      ))}
                    </div>
                  </Col>
                  <Col md={6}>
  <div className="mb-2 text-muted small">Filter by time</div>
                    <div className="d-flex flex-wrap gap-2">
                      {[
  { value: 'all', label: 'All', count: sorted.length },
  { value: 'upcoming', label: 'Upcoming', count: upcomingCount },
  { value: 'past', label: 'Past', count: pastCount },
                      ].map(({ value, label, count }) => (
                        <Button
                          key={value}
                          size="sm"
                           variant={timeFilter === value ? 'outline-dark' : 'outline-secondary'}
                          style={{ fontSize: '0.95rem', fontWeight: 600 }}
                          onClick={() => setTimeFilter(value as TimeFilter)}
                        >
                          {label} ({count})
                        </Button>
                      ))}
                    </div>
                  </Col>
                </Row>
              </details>
            </div>
          </Card.Body>
        </Card>
      )}

      {filtered.length === 0 && phone && !loading && (
        <Alert variant="light" className="alert-brand">
  No records found for the selected conditions
        </Alert>
      )}

      <Row className="g-3">
        {filtered.map((bk) => (
          <Col md={6} lg={4} key={bk.id}>
            <Card className="h-100 shadow-sm hover-card card-soft border-light">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-bold">{bk.service_name}</div>
  <div className="text-muted small">by {bk.therapist_name}</div>
                  </div>
                  <Badge className={
                    bk.status.toLowerCase() === 'confirmed' ? 'badge-amber' :
                    bk.status.toLowerCase() === 'pending' ? 'badge-olive' :
                    bk.status.toLowerCase() === 'cancelled' ? 'badge-brick' : 'badge-slate'
                  }>
                    {statusLabel(bk.status)}
                  </Badge>
                </div>
                <div className="mt-2">
                  <div>📅 {formatDate(bk.booking_datetime)}</div>
  <div className="text-muted small">Phone: {bk.customer_phone}</div>
                </div>
                <div className="mt-3 pt-3 d-flex justify-content-between align-items-center card-divider">
  <div className="text-muted">Price</div>
                  <div className="text-primary fw-semibold">฿{Number(bk.price_at_booking ?? 0).toLocaleString()}</div>
                </div>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between align-items-center">
                {isUpcoming(bk.booking_datetime) ? (
  <Badge className="badge-olive">Upcoming</Badge>
                ) : (
  <Badge className="badge-slate">Past</Badge>
                )}
                <div className="text-muted small">
  Reference ID: <span className="fw-bold">BK-{bk.id.toString().padStart(6, '0')}</span>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default BookingHistory;