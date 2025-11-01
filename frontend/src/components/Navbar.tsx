import { Navbar as BSNavbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store';
import { authAPI } from '../api/client';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const navbarRef = useRef<HTMLDivElement | null>(null);

  // ปิด navbar เมื่อคลิกนอกพื้นที่ (สำหรับอุปกรณ์มือถือและเดสก์ท็อป)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (!expanded) return;
      const target = e.target as Node | null;
      if (navbarRef.current && target && !navbarRef.current.contains(target)) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick, true);
    document.addEventListener('touchstart', handleOutsideClick, true);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
      document.removeEventListener('touchstart', handleOutsideClick, true);
    };
  }, [expanded]);


  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      setExpanded(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div ref={navbarRef}>
    <BSNavbar bg="light" variant="light" expand="lg" className="navbar" expanded={expanded}>
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="navbar-brand" onClick={() => setExpanded(false)}>
          <span className="logo">BUALIN</span> 
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(prev => !prev)} />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>Home</Nav.Link>
            <Nav.Link as={Link} to="/services" onClick={() => setExpanded(false)}>Services</Nav.Link>
            <Nav.Link as={Link} to="/booking/history" onClick={() => setExpanded(false)}>Booking History</Nav.Link>
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Nav.Link as={Link} to="/admin" onClick={() => setExpanded(false)}>Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/admin/services" onClick={() => setExpanded(false)}>Manage Services</Nav.Link>
                <Nav.Link as={Link} to="/admin/therapists" onClick={() => setExpanded(false)}>Manage Therapists</Nav.Link>
                <Nav.Link as={Link} to="/admin/schedule" onClick={() => setExpanded(false)}>Schedule</Nav.Link>
                <Nav.Link as={Link} to="/admin/days-off" onClick={() => setExpanded(false)}>Manage Days Off</Nav.Link>
                <Nav.Link as={Link} to="/admin/users" onClick={() => setExpanded(false)}>Manage Users</Nav.Link>
              </>
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
    </div>
  );
};
