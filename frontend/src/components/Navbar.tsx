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
    <BSNavbar bg="light" variant="light" expand="lg" className="navbar">
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="navbar-brand">
          <span className="logo">BUALIN</span> 
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/services">Services</Nav.Link>
            <Nav.Link as={Link} to="/booking/history">Booking History</Nav.Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
            )}
          </Nav>
          <Nav className="align-items-center">
            {isAuthenticated && user?.role === 'admin' ? (
              <>
                <span className="nav-link" style={{ cursor: 'default' }}>
                  Hello, {user?.full_name}
                </span>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={handleLogout}
                  style={{ marginLeft: '1rem' }}
                >
                  Logout
                </Button>
              </>
            ) : null}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};
