import { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Row, Col, Alert, Card, Modal } from 'react-bootstrap';
import { adminAPI } from '../api/client';

interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  is_verified: boolean;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [form, setForm] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<{ full_name?: string; email?: string; phone?: string; role?: User['role']; password?: string; is_verified?: boolean }>({ role: 'user', is_verified: true });
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');
  const [onConfirm, setOnConfirm] = useState<(() => Promise<void>) | null>(null);
  const [showCreate, setShowCreate] = useState<boolean>(false);

  const load = async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data.users);
    } catch (e) {
      setError('โหลดข้อมูลผู้ใช้ล้มเหลว');
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (u: User) => {
    setSelected(u);
    setForm({ ...u });
    setMessage('');
    setError('');
  };

  const save = async () => {
    if (!form) return;
    try {
      const payload: any = {
        full_name: form.full_name,
        phone: form.phone,
        role: form.role,
        is_verified: Boolean(form.is_verified),
      };
      await adminAPI.updateUser(form.id, payload);
      setMessage('บันทึกข้อมูลผู้ใช้สำเร็จ');
      setSelected(null);
      setForm(null);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'บันทึกข้อมูลล้มเหลว');
    }
  };

  const createItem = () => {
    const payload = {
      full_name: String(createForm.full_name || ''),
      email: String((createForm.email || '').toLowerCase()),
      phone: createForm.phone,
      password: String(createForm.password || ''),
      role: createForm.role ?? 'user',
      is_verified: createForm.is_verified ?? true,
    };
    setConfirmText('ยืนยันการเพิ่มผู้ใช้ใหม่?');
    setOnConfirm(() => async () => {
      try {
        await adminAPI.createUser(payload);
        setMessage('เพิ่มผู้ใช้ใหม่สำเร็จ');
        setCreateForm({ role: 'user', is_verified: true });
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
    setConfirmText('ยืนยันการลบผู้ใช้นี้?');
    setOnConfirm(() => async () => {
      try {
        await adminAPI.deleteUser(id);
        setMessage('ลบผู้ใช้สำเร็จ');
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
          <h3>จัดการบัญชีผู้ใช้</h3>
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
          <Button onClick={() => setShowCreate(true)}>เพิ่มผู้ใช้ใหม่</Button>
        </Col>
      </Row>
      <Modal show={showCreate} onHide={() => setShowCreate(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>เพิ่มผู้ใช้ใหม่</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-2">
            <Col md={3}>
              <Form.Group>
                <Form.Label>ชื่อเต็ม</Form.Label>
                <Form.Control value={createForm.full_name || ''}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>อีเมล</Form.Label>
                <Form.Control type="email" value={createForm.email || ''}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>เบอร์โทร</Form.Label>
                <Form.Control value={createForm.phone || ''}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>รหัสผ่าน</Form.Label>
                <Form.Control type="password" value={createForm.password || ''}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>บทบาท</Form.Label>
                <Form.Select value={createForm.role || 'user'}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as User['role'] })}>
                  <option value="user">ผู้ใช้</option>
                  <option value="admin">แอดมิน</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>ยืนยันอีเมล</Form.Label>
                <Form.Select value={(createForm.is_verified ?? true) ? '1' : '0'}
                  onChange={(e) => setCreateForm({ ...createForm, is_verified: e.target.value === '1' })}>
                  <option value="1">ยืนยันแล้ว</option>
                  <option value="0">ยังไม่ยืนยัน</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={createItem}>เพิ่มผู้ใช้</Button>
          <Button variant="secondary" onClick={() => setCreateForm({ role: 'user', is_verified: true })}>ล้างฟอร์ม</Button>
          <Button variant="outline-secondary" onClick={() => setShowCreate(false)}>ปิด</Button>
        </Modal.Footer>
      </Modal>

      {selected && form && (
        <Card className="mb-3">
          <Card.Body>
            <Row className="g-2">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>ชื่อเต็ม</Form.Label>
                  <Form.Control value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>เบอร์โทร</Form.Label>
                  <Form.Control value={form.phone || ''}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>บทบาท</Form.Label>
                  <Form.Select value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as User['role'] })}>
                    <option value="user">ผู้ใช้</option>
                    <option value="admin">แอดมิน</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>ยืนยันอีเมล</Form.Label>
                  <Form.Select value={form.is_verified ? '1' : '0'}
                    onChange={(e) => setForm({ ...form, is_verified: e.target.value === '1' })}>
                    <option value="1">ยืนยันแล้ว</option>
                    <option value="0">ยังไม่ยืนยัน</option>
                  </Form.Select>
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
            <th>ชื่อเต็ม</th>
            <th>อีเมล</th>
            <th>บทบาท</th>
            <th>สถานะยืนยัน</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.is_verified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}</td>
              <td>
                <Button size="sm" className="me-2" onClick={() => startEdit(u)}>แก้ไข</Button>
                <Button size="sm" variant="danger" onClick={() => deleteItem(u.id)}>ลบ</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};