import { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Row, Col, Alert, Card, Modal } from 'react-bootstrap';
import { adminAPI } from '../api/client';

interface Therapist {
  id: number;
  name: string;
  specialty?: string;
  bio?: string;
  is_active: boolean;
}

export const AdminTherapists = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selected, setSelected] = useState<Therapist | null>(null);
  const [form, setForm] = useState<Therapist | null>(null);
  const [createForm, setCreateForm] = useState<Partial<Therapist>>({ is_active: true });
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');
  const [onConfirm, setOnConfirm] = useState<(() => Promise<void>) | null>(null);
  const [showCreate, setShowCreate] = useState<boolean>(false);

  const load = async () => {
    try {
      const res = await adminAPI.getTherapists();
      setTherapists(res.data.therapists);
    } catch (e) {
      setError('โหลดข้อมูลพนักงานล้มเหลว');
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (t: Therapist) => {
    setSelected(t);
    setForm({ ...t });
    setMessage('');
    setError('');
  };

  const save = async () => {
    if (!form) return;
    try {
      const payload = {
        name: form.name,
        specialty: form.specialty,
        bio: form.bio,
        is_active: Boolean(form.is_active),
      };
      await adminAPI.updateTherapist(form.id, payload);
      setMessage('บันทึกข้อมูลพนักงานสำเร็จ');
      setSelected(null);
      setForm(null);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'บันทึกข้อมูลล้มเหลว');
    }
  };

  const createItem = () => {
    const payload = {
      name: String(createForm.name || ''),
      specialty: createForm.specialty,
      bio: createForm.bio,
      is_active: createForm.is_active ?? true,
    };
    setConfirmText('ยืนยันการเพิ่มนักบำบัดใหม่?');
    setOnConfirm(() => async () => {
      try {
        await adminAPI.createTherapist(payload);
        setMessage('เพิ่มนักบำบัดใหม่สำเร็จ');
        setCreateForm({ is_active: true });
        setShowConfirm(false);
        await load();
      } catch (e: any) {
        setError(e?.response?.data?.message || 'เพิ่มข้อมูลล้มเหลว');
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const deleteItem = (id: number) => {
    setConfirmText('ยืนยันการลบนักบำบัดนี้?');
    setOnConfirm(() => async () => {
      try {
        await adminAPI.deleteTherapist(id);
        setMessage('ลบนักบำบัดสำเร็จ');
        setShowConfirm(false);
        await load();
      } catch (e: any) {
        setError(e?.response?.data?.message || 'ลบข้อมูลล้มเหลว');
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h3>จัดการนักบำบัด</h3>
        </Col>
      </Row>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>ยืนยันการทำรายการ</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmText}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>ยกเลิก</Button>
          <Button variant="primary" onClick={async () => { if (onConfirm) await onConfirm(); }}>ยืนยัน</Button>
        </Modal.Footer>
      </Modal>

      <Row className="mb-3">
        <Col>
          <Button onClick={() => setShowCreate(true)}>เพิ่มนักบำบัดใหม่</Button>
        </Col>
      </Row>
      <Modal show={showCreate} onHide={() => setShowCreate(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>เพิ่มนักบำบัดใหม่</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-2">
            <Col md={4}>
              <Form.Group>
                <Form.Label>ชื่อ</Form.Label>
                <Form.Control value={createForm.name || ''}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>ความถนัด</Form.Label>
                <Form.Control value={createForm.specialty || ''}
                  onChange={(e) => setCreateForm({ ...createForm, specialty: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>สถานะ</Form.Label>
                <Form.Select value={(createForm.is_active ?? true) ? '1' : '0'}
                  onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.value === '1' })}>
                  <option value="1">เปิด</option>
                  <option value="0">ปิด</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>ประวัติ/คำอธิบาย</Form.Label>
                <Form.Control as="textarea" rows={2} value={createForm.bio || ''}
                  onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={createItem}>เพิ่มนักบำบัด</Button>
          <Button variant="secondary" onClick={() => setCreateForm({ is_active: true })}>ล้างฟอร์ม</Button>
          <Button variant="outline-secondary" onClick={() => setShowCreate(false)}>ปิด</Button>
        </Modal.Footer>
      </Modal>

      {selected && form && (
        <Card className="mb-3">
          <Card.Body>
            <Row className="g-2">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>ชื่อ</Form.Label>
                  <Form.Control value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>ความถนัด</Form.Label>
                  <Form.Control value={form.specialty || ''}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>สถานะ</Form.Label>
                  <Form.Select value={form.is_active ? '1' : '0'}
                    onChange={(e) => setForm({ ...form, is_active: e.target.value === '1' })}>
                    <option value="1">เปิด</option>
                    <option value="0">ปิด</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>ประวัติ/คำอธิบาย</Form.Label>
                  <Form.Control as="textarea" rows={2} value={form.bio || ''}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={12} className="mt-2 d-flex gap-2">
                <Button onClick={save}>บันทึก</Button>
                <Button variant="secondary" onClick={() => { setSelected(null); setForm(null); }}>ยกเลิก</Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>ชื่อ</th>
            <th>ความถนัด</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {therapists.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.name}</td>
              <td>{t.specialty || '-'}</td>
              <td>{t.is_active ? 'เปิด' : 'ปิด'}</td>
              <td>
                <Button size="sm" className="me-2" onClick={() => startEdit(t)}>แก้ไข</Button>
                <Button size="sm" variant="danger" onClick={() => deleteItem(t.id)}>ลบ</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};