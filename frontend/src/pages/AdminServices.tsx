import { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Row, Col, Alert, Card, Modal } from 'react-bootstrap';
import { adminAPI } from '../api/client';

interface Service {
  id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  base_price: number;
  image_path?: string;
  is_active: boolean;
}

export const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
  const [form, setForm] = useState<Service | null>(null);
  const [createForm, setCreateForm] = useState<Partial<Service>>({ is_active: true });
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');
  const [onConfirm, setOnConfirm] = useState<(() => Promise<void>) | null>(null);
  const [showCreate, setShowCreate] = useState<boolean>(false);

  const load = async () => {
    try {
      const res = await adminAPI.getServices();
      setServices(res.data.services);
    } catch (e) {
      setError('โหลดข้อมูลบริการล้มเหลว');
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (s: Service) => {
    setSelected(s);
    setForm({ ...s });
    setMessage('');
    setError('');
  };

  const save = async () => {
    if (!form) return;
    try {
      const payload = {
        name: form.name,
        description: form.description,
        duration_minutes: Number(form.duration_minutes),
        base_price: Number(form.base_price),
        image_path: form.image_path,
        is_active: Boolean(form.is_active),
      };
      await adminAPI.updateService(form.id, payload);
      setMessage('บันทึกข้อมูลบริการสำเร็จ');
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
      description: createForm.description,
      duration_minutes: Number(createForm.duration_minutes || 0),
      base_price: Number(createForm.base_price || 0),
      image_path: createForm.image_path,
      is_active: createForm.is_active ?? true,
    };
    setConfirmText('ยืนยันการเพิ่มบริการใหม่?');
    setOnConfirm(() => async () => {
      try {
        await adminAPI.createService(payload);
        setMessage('เพิ่มบริการใหม่สำเร็จ');
        setCreateForm({ is_active: true });
        setShowConfirm(false);
        await load();
      } catch (e: any) {
        setError(e?.response?.data?.message || 'เพิ่มข้อมูลล้มเหลว');
        setShowConfirm(false);
      }
    });
    // เปิดหน้าต่างยืนยันหลังกรอกฟอร์มใน Modal เพิ่มบริการ
    setShowConfirm(true);
  };

  const deleteItem = (id: number) => {
    setConfirmText('ยืนยันการลบบริการนี้?');
    setOnConfirm(() => async () => {
      try {
        await adminAPI.deleteService(id);
        setMessage('ลบบริการสำเร็จ');
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
          <h3>จัดการบริการ</h3>
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
          <Button onClick={() => setShowCreate(true)}>เพิ่มบริการใหม่</Button>
        </Col>
      </Row>
      <Modal show={showCreate} onHide={() => setShowCreate(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>เพิ่มบริการใหม่</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-2">
            <Col md={3}>
              <Form.Group>
                <Form.Label>ชื่อบริการ</Form.Label>
                <Form.Control value={createForm.name || ''}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>ระยะเวลา (นาที)</Form.Label>
                <Form.Control type="number" value={createForm.duration_minutes || ''}
                  onChange={(e) => setCreateForm({ ...createForm, duration_minutes: Number(e.target.value) })} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>ราคา (บาท)</Form.Label>
                <Form.Control type="number" value={createForm.base_price || ''}
                  onChange={(e) => setCreateForm({ ...createForm, base_price: Number(e.target.value) })} />
              </Form.Group>
            </Col>
            <Col md={3}>
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
                <Form.Label>รายละเอียด</Form.Label>
                <Form.Control as="textarea" rows={2} value={createForm.description || ''}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={createItem}>เพิ่มบริการ</Button>
          <Button variant="secondary" onClick={() => setCreateForm({ is_active: true })}>ล้างฟอร์ม</Button>
          <Button variant="outline-secondary" onClick={() => setShowCreate(false)}>ปิด</Button>
        </Modal.Footer>
      </Modal>

      {selected && form && (
        <Card className="mb-3">
          <Card.Body>
            <Row className="g-2">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>ชื่อบริการ</Form.Label>
                  <Form.Control value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>ระยะเวลา (นาที)</Form.Label>
                  <Form.Control type="number" value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>ราคา (บาท)</Form.Label>
                  <Form.Control type="number" value={form.base_price}
                    onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })} />
                </Form.Group>
              </Col>
              <Col md={3}>
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
                  <Form.Label>รายละเอียด</Form.Label>
                  <Form.Control as="textarea" rows={2} value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
            <th>ชื่อบริการ</th>
            <th>ระยะเวลา</th>
            <th>ราคา</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td>{s.duration_minutes} นาที</td>
              <td>{s.base_price} ฿</td>
              <td>{s.is_active ? 'เปิด' : 'ปิด'}</td>
              <td>
                <Button size="sm" className="me-2" onClick={() => startEdit(s)}>แก้ไข</Button>
                <Button size="sm" variant="danger" onClick={() => deleteItem(s.id)}>ลบ</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};