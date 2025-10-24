import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { Home } from './pages/Home';
import { Register } from './pages/Register';
// Import other pages as needed

const ProtectedRoute = ({ children, adminOnly = false }: any) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<div>Login Page (TODO)</div>} />
        <Route path="/services" element={<div>Services Page (TODO)</div>} />
        <Route path="/verify-email" element={<div>Verify Email Page (TODO)</div>} />
        <Route
          path="/booking/*"
          element={
            <ProtectedRoute>
              <div>Booking Flow (TODO)</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <div>Admin Dashboard (TODO)</div>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div className="text-center mt-5"><h1>404 - ไม่พบหน้านี้</h1></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
