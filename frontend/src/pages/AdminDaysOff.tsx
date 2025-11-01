import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert, Card } from 'react-bootstrap';
import { adminAPI } from '../api/client';

interface Therapist { id: number; name: string }
interface DayOff { id: number; therapist_id: number; day_off: string; note?: string }

const formatMonth = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
const firstDayOfMonth = (month: string) => new Date(`${month}-01T00:00:00`);
const lastDayOfMonthStr = (month: string) => {
  const d = firstDayOfMonth(month);
  d.setMonth(d.getMonth()+1); // next month
  d.setDate(0); // last day of previous month
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};

export const AdminDaysOff = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [daysOff, setDaysOff] = useState<DayOff[]>([]);
  const [month, setMonth] = useState<string>(formatMonth(new Date()));
  const [filterTherapistId, setFilterTherapistId] = useState<number | undefined>(undefined);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Create form
  const [createTherapistId, setCreateTherapistId] = useState<number | undefined>(undefined);
  const [createDate, setCreateDate] = useState<string>('');
  const [createNote, setCreateNote] = useState<string>('');

  const minDate = useMemo(() => `${month}-01`, [month]);
  const maxDate = useMemo(() => lastDayOfMonthStr(month), [month]);

  const loadTherapists = async () => {
    try {
      const res = await adminAPI.getTherapists();
      setTherapists(res.data.therapists || []);
      if (!createTherapistId && res.data.therapists?.length) {
        setCreateTherapistId(res.data.therapists[0].id);
      }
    } catch (e) {
      setError('โหลดรายชื่อนักบำบัดล้มเหลว');
    }
  };

  const loadDaysOff = async () => {
    try {
      const res = await adminAPI.getDaysOff({ month, therapist_id: filterTherapistId });
      setDaysOff(res.data.daysOff || []);
      setError('');
    } catch (e) {
      setError('โหลดวันหยุดล้มเหลว');
    }
  };

  useEffect(() => { loadTherapists(); }, []);
  useEffect(() => { loadDaysOff(); }, [month, filterTherapistId]);

  const addDayOff = async () => {
    setMessage(''); setError('');
    if (!createTherapistId || !createDate) {
      setError('กรุณาเลือกนักบำบัดและวันที่');
      return;
    }
    // enforce current month
    if (!createDate.startsWith(`${month}-`)) {
      setError('วันที่ต้องอยู่ในเดือนที่เลือก');
      return;
    }
    try {
      await adminAPI.createDayOff({ therapist_id: createTherapistId, day_off: createDate, note: createNote || undefined });
      setMessage('บันทึกวันหยุดสำเร็จ');
      setCreateDate('');
      setCreateNote('');
      await loadDaysOff();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'บันทึกวันหยุดล้มเหลว');
    }
  };

  const deleteDayOff = async (id: number) => {
    setMessage(''); setError('');
    try {
      await adminAPI.deleteDayOff(id);
      setMessage('ลบวันหยุดสำเร็จ');
      await loadDaysOff();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'ลบวันหยุดล้มเหลว');
    }
  };

  return (
    <Container className="mt-4">
      <Row className="mb-3"><Col><h3>จัดการวันหยุดนักบำบัด</h3></Col></Row>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-3">
        <Card.Body>
          <Row className="g-2">
            <Col md={4}>
              <Form.Group>
                <Form.Label>เดือน</Form.Label>
                <Form.Control type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>นักบำบัด (ตัวกรอง)</Form.Label>
                <Form.Select value={String(filterTherapistId || '')} onChange={(e) => setFilterTherapistId(e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">ทั้งหมด</option>
                  {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Header>เพิ่มวันหยุดในเดือนนี้</Card.Header>
        <Card.Body>
          <Row className="g-2">
            <Col md={4}>
              <Form.Group>
                <Form.Label>นักบำบัด</Form.Label>
                <Form.Select value={String(createTherapistId || '')} onChange={(e) => setCreateTherapistId(Number(e.target.value))}>
                  {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>วันที่</Form.Label>
                <Form.Control type="date" value={createDate} min={minDate} max={maxDate} onChange={(e) => setCreateDate(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>หมายเหตุ</Form.Label>
                <Form.Control value={createNote} onChange={(e) => setCreateNote(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={12} className="mt-2">
              <Button onClick={addDayOff}>เพิ่มวันหยุด</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>วันที่</th>
            <th>นักบำบัด</th>
            <th>หมายเหตุ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {daysOff.map(d => {
            const therapist = therapists.find(t => t.id === d.therapist_id);
            return (
              <tr key={d.id}>
                <td>{d.day_off}</td>
                <td>{therapist?.name || d.therapist_id}</td>
                <td>{d.note || '-'}</td>
                <td>
                  <Button size="sm" variant="danger" onClick={() => deleteDayOff(d.id)}>ลบ</Button>
                </td>
              </tr>
            );
          })}
          {daysOff.length === 0 && (
            <tr><td colSpan={4} className="text-center">ไม่พบวันหยุดในเดือนนี้</td></tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};