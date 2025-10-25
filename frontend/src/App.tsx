import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store';
import { authAPI } from './api/client';
import { Home } from './pages/Home';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { VerifyEmail } from './pages/VerifyEmail';
import { Services } from './pages/Services';
import { BookingService } from './pages/BookingService';
import { BookingTherapist } from './pages/BookingTherapist';
import { BookingDatetime } from './pages/BookingDatetime';
import { BookingConfirm } from './pages/BookingConfirm';
import { AdminDashboard } from './pages/AdminDashboard';
import { Navbar } from './components/Navbar';
import { Footer } from './components/footer';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.getMe();
        setUser(response.data.user);
      } catch {
        setUser(null);
      }
    };
    checkAuth();
  }, [setUser]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/services" element={<Services />} />
        
        {/* Protected booking routes */}
        <Route
          path="/booking/service"
          element={
            <ProtectedRoute>
              <BookingService />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/therapist"
          element={
            <ProtectedRoute>
              <BookingTherapist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/datetime"
          element={
            <ProtectedRoute>
              <BookingDatetime />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/confirm"
          element={
            <ProtectedRoute>
              <BookingConfirm />
            </ProtectedRoute>
          }
        />
        
        {/* Admin route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<div className="text-center mt-5"><h1>404 - Page Not Found</h1></div>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
