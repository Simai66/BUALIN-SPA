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
import BookingHistory from './pages/BookingHistory';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminServices } from './pages/AdminServices';
import { AdminTherapists } from './pages/AdminTherapists';
import { AdminDaysOff } from './pages/AdminDaysOff';
import { AdminUsers } from './pages/AdminUsers';
import { AdminSchedule } from './pages/AdminSchedule';
import { Navbar } from './components/Navbar';
import { Footer } from './components/footer';
import { ScrollToTop } from './components/ScrollToTop';

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
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/services" element={<Services />} />
        
        {/* Public booking routes (no login required) */}
        <Route path="/booking/service" element={<BookingService />} />
        <Route path="/booking/therapist" element={<BookingTherapist />} />
        <Route path="/booking/datetime" element={<BookingDatetime />} />
        <Route path="/booking/confirm" element={<BookingConfirm />} />
        <Route path="/booking/history" element={<BookingHistory />} />
        
        {/* Admin route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute adminOnly>
              <AdminServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/therapists"
          element={
            <ProtectedRoute adminOnly>
              <AdminTherapists />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/days-off"
          element={
            <ProtectedRoute adminOnly>
              <AdminDaysOff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedule"
          element={
            <ProtectedRoute adminOnly>
              <AdminSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
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
