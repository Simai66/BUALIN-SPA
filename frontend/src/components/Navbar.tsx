import { Navbar as BSNavbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { authAPI } from '../api/client';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <BSNavbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BSNavbar.Brand as={Link} to="/">🌸 ไทยสปา</BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">หน้าแรก</Nav.Link>
            <Nav.Link as={Link} to="/services">บริการ</Nav.Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Nav.Link as={Link} to="/admin">แอดมิน</Nav.Link>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Link disabled>สวัสดี, {user?.full_name}</Nav.Link>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  ออกจากระบบ
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">เข้าสู่ระบบ</Nav.Link>
                <Nav.Link as={Link} to="/register">สมัครสมาชิก</Nav.Link>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};
