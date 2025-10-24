import { useState } from 'react';
import { Container, Card, Row, Col, Button, Alert, ListGroup, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../api/client';
import { useBookingStore } from '../store';

export const BookingConfirm = () => {
  const navigate = useNavigate();
  const { selectedService, selectedTherapist, selectedDatetime, reset } = useBookingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  if (!selectedService || !selectedTherapist || !selectedDatetime) {
    navigate('/booking/service');
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

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await bookingsAPI.create({
        service_id: selectedService.id,
        therapist_id: selectedTherapist.id,
        booking_datetime: selectedDatetime.toISOString(),
      });
      setShowModal(true);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'เกิดข้อผิดพลาดในการจองบริการ');
      } else {
        setError('เกิดข้อผิดพลาดในการจองบริการ');
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
      <div className="mb-4">
        <h2>ยืนยันการจองบริการ</h2>
        <p className="text-muted">โปรดตรวจสอบข้อมูลก่อนยืนยันการจอง</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">รายละเอียดการจอง</h5>
        </Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Row>
                <Col sm={4} className="fw-bold">บริการ:</Col>
                <Col sm={8}>{selectedService.name}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col sm={4} className="fw-bold">รายละเอียด:</Col>
                <Col sm={8}>{selectedService.description}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col sm={4} className="fw-bold">ระยะเวลา:</Col>
                <Col sm={8}>{selectedService.duration_minutes} นาที</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col sm={4} className="fw-bold">พนักงาน:</Col>
                <Col sm={8}>{selectedTherapist.name}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col sm={4} className="fw-bold">วันและเวลา:</Col>
                <Col sm={8}>{formatDateTime(selectedDatetime)}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col sm={4} className="fw-bold">ราคา:</Col>
                <Col sm={8} className="text-success fw-bold fs-5">
                  {selectedService.base_price?.toLocaleString('th-TH')} บาท
                </Col>
              </Row>
            </ListGroup.Item>
          </ListGroup>

          <Alert variant="info" className="mt-3 mb-0">
            <strong>หมายเหตุ:</strong> ราคาสุดท้ายจะคำนวณตามโปรโมชั่นที่มีอยู่ในขณะนั้น
            และจะแสดงในอีเมลยืนยันการจองที่จะส่งให้ท่าน
          </Alert>
        </Card.Body>
      </Card>

      <div className="mt-4 d-flex justify-content-between">
        <Button variant="secondary" onClick={handleBack} disabled={loading}>
          ← ย้อนกลับ
        </Button>
        <Button
          variant="success"
          onClick={handleConfirm}
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              กำลังดำเนินการ...
            </>
          ) : (
            'ยืนยันการจอง'
          )}
        </Button>
      </div>

      {/* Success Modal */}
      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>จองบริการสำเร็จ!</Modal.Title>
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
          <h5>การจองของท่านสำเร็จแล้ว</h5>
          <p className="text-muted mb-0">
            ระบบได้ส่งอีเมลยืนยันการจองไปยังอีเมลของท่านแล้ว
            <br />
            โปรดตรวจสอบอีเมลเพื่อดูรายละเอียดการจอง
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleModalClose}>
            กลับหน้าหลัก
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
