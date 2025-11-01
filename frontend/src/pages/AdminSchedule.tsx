import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, ButtonGroup } from 'react-bootstrap';
import { bookingsAPI, adminAPI } from '../api/client';

interface Therapist { id: number; name: string }
interface Booking {
  id: number;
  service_id: number;
  therapist_id: number;
  booking_datetime: string; // ISO
  status: string;
  service_name: string;
  therapist_name: string;
}

const hours = Array.from({ length: 12 }, (_, i) => i + 9); // 9:00 - 20:00
type ViewMode = 'week' | 'three' | 'day';

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function AdminSchedule() {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapists, setSelectedTherapists] = useState<number[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [daysOff, setDaysOff] = useState<Record<string, number[]>>({}); // date -> therapistIds
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('three');
  const [density, setDensity] = useState<'compact' | 'comfortable'>('compact');
  const numberDays = useMemo(() => (viewMode === 'week' ? 7 : viewMode === 'three' ? 3 : 1), [viewMode]);
  const sizes = useMemo(() => ({
    cellHeight: density === 'compact' ? 36 : 56,
    fontSize: density === 'compact' ? 11 : 12,
    timeColWidth: density === 'compact' ? 100 : 130,
    dayColWidth: density === 'compact' ? 120 : 150,
    gridMinWidth: (density === 'compact' ? 100 : 130) + (density === 'compact' ? 120 : 150) * numberDays,
    cardPadding: density === 'compact' ? '0.35rem' : '0.5rem',
  }), [density, numberDays]);

  const days = useMemo(() => {
    return Array.from({ length: numberDays }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart, numberDays]);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const res = await adminAPI.getTherapists();
        setTherapists(res.data.therapists || []);
      } catch (err) {
        console.error('Load therapists failed', err);
        setTherapists([]);
      }
    };
    fetchTherapists();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const startISO = new Date(weekStart);
        const endISO = new Date(weekStart);
        endISO.setDate(endISO.getDate() + (numberDays - 1));
        endISO.setHours(23, 59, 59, 999);

        const params: any = { start: startISO.toISOString(), end: endISO.toISOString() };
        const res = await bookingsAPI.list(params);
        setBookings(res.data.bookings || []);

        // Days off map
        const month = formatYMD(weekStart).slice(0, 7);
        const doRes = await adminAPI.getDaysOff({ month });
        const map: Record<string, number[]> = {};
        for (const item of (doRes.data.daysOff || [])) {
          const date = item.day_off;
          if (!map[date]) map[date] = [];
          map[date].push(item.therapist_id);
        }
        setDaysOff(map);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [weekStart, numberDays]);

  const visibleTherapists = therapists.filter(t => selectedTherapists.length === 0 || selectedTherapists.includes(t.id));

  const next = () => setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() + numberDays); return d; });
  const prev = () => setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() - numberDays); return d; });
  const thisWeek = () => setWeekStart(startOfWeek(new Date()));

  return (
    <Container fluid className="mt-4">
      <Row className="mb-3">
        <Col>
          <h2>Admin Schedule</h2>
          <div className="text-muted" style={{ fontSize: 12 }}>{formatYMD(days[0])} - {formatYMD(days[days.length - 1])}</div>
        </Col>
        <Col md="auto" className="d-flex gap-2 align-items-center">
          <Button variant="secondary" onClick={prev}>Prev</Button>
          <Button variant="outline-secondary" onClick={thisWeek}>Today</Button>
          <Button variant="secondary" onClick={next}>Next</Button>
          <ButtonGroup className="ms-2">
            <Button size="sm" variant={density === 'compact' ? 'primary' : 'outline-primary'} onClick={() => setDensity('compact')}>Compact</Button>
            <Button size="sm" variant={density === 'comfortable' ? 'primary' : 'outline-primary'} onClick={() => setDensity('comfortable')}>Comfort</Button>
          </ButtonGroup>
          <ButtonGroup className="ms-2">
            <Button size="sm" variant={viewMode === 'day' ? 'primary' : 'outline-primary'} onClick={() => setViewMode('day')}>Day</Button>
            <Button size="sm" variant={viewMode === 'three' ? 'primary' : 'outline-primary'} onClick={() => setViewMode('three')}>3 Days</Button>
            <Button size="sm" variant={viewMode === 'week' ? 'primary' : 'outline-primary'} onClick={() => setViewMode('week')}>Week</Button>
          </ButtonGroup>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filter therapists</Form.Label>
            <Form.Select multiple value={selectedTherapists.map(String)} onChange={(e) => {
              const options = Array.from(e.target.selectedOptions).map(o => Number(o.value));
              setSelectedTherapists(options);
            }} style={{ height: 120 }}>
              {therapists.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <Spinner animation="border" />
        </div>
      ) : (
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh' }}>
          <div style={{ minWidth: sizes.gridMinWidth }}>
            {/* Header row: days */}
            <Row className="mb-2">
              <Col style={{ flex: `0 0 ${sizes.timeColWidth}px`, maxWidth: sizes.timeColWidth }}><strong>Time</strong></Col>
              {days.map((d, idx) => (
                <Col key={idx} style={{ minWidth: sizes.dayColWidth }}>
                  <div style={{ fontSize: sizes.fontSize + 1 }}><strong>{d.toLocaleDateString(undefined, { weekday: 'short' })}</strong></div>
                  <small style={{ fontSize: sizes.fontSize }}>{formatYMD(d)}</small>
                </Col>
              ))}
            </Row>

            {/* Grid rows */}
            {hours.map(h => (
              <Row key={h} className="align-items-stretch" style={{ borderTop: '1px solid #eee' }}>
                <Col className="py-2" style={{ flex: `0 0 ${sizes.timeColWidth}px`, maxWidth: sizes.timeColWidth }}>
                  <strong style={{ fontSize: sizes.fontSize + 1 }}>{String(h).padStart(2, '0')}:00</strong>
                </Col>
                {days.map((d, di) => {
                  const dateStr = formatYMD(d);
                  const offIds = daysOff[dateStr] || [];
                  const cellBookings = bookings.filter(b => {
                    const bd = new Date(b.booking_datetime);
                    return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth() && bd.getDate() === d.getDate() && bd.getHours() === h;
                  }).filter(b => (selectedTherapists.length === 0 || selectedTherapists.includes(b.therapist_id)));

                  return (
                    <Col key={di} className="py-1" style={{ minHeight: sizes.cellHeight, borderLeft: '1px solid #f5f5f5' }}>
                      {cellBookings.length === 0 ? (
                        <div className="text-muted" style={{ fontSize: sizes.fontSize }}>
                          {offIds.length > 0 ? (
                            <Badge bg="light" text="dark" style={{ fontSize: sizes.fontSize }}>Day Off: {offIds.length}</Badge>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                      ) : (
                        cellBookings.map(b => (
                          <Card key={b.id} className="mb-1" bg={b.status === 'pending' ? 'warning' : b.status === 'confirmed' ? 'success' : 'secondary'} text="white">
                            <Card.Body style={{ padding: sizes.cardPadding }}>
                              <div style={{ fontSize: sizes.fontSize }}>
                                <strong>{b.service_name}</strong>
                                <div>{b.therapist_name}</div>
                                <div>{new Date(b.booking_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                <Badge bg="dark" className="mt-1">{b.status}</Badge>
                              </div>
                            </Card.Body>
                          </Card>
                        ))
                      )}
                    </Col>
                  );
                })}
              </Row>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}