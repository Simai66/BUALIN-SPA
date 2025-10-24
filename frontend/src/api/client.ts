import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
  verifyEmail: (token: string, email: string) => 
    api.get(`/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`),
};

// Services APIs
export const servicesAPI = {
  getAll: () => api.get('/api/services'),
};

// Therapists APIs
export const therapistsAPI = {
  getAll: () => api.get('/api/therapists'),
};

// Promotions APIs
export const promotionsAPI = {
  getAll: () => api.get('/api/promotions'),
};

// Bookings APIs
export const bookingsAPI = {
  getAll: (params?: any) => api.get('/api/bookings', { params }),
  create: (data: any) => api.post('/api/bookings', data),
  updateStatus: (id: number, status: string) => 
    api.put(`/api/bookings/${id}/status`, { status }),
  getSlots: (params: any) => api.get('/api/booking/slots', { params }),
};

// Admin APIs
export const adminAPI = {
  getDashboard: (params?: any) => api.get('/api/admin/dashboard', { params }),
  exportPDF: (params?: any) => 
    api.get('/api/admin/export/pdf', { params, responseType: 'blob' }),
  exportExcel: (params?: any) => 
    api.get('/api/admin/export/excel', { params, responseType: 'blob' }),
};

// Gallery APIs
export const galleryAPI = {
  getAll: () => api.get('/api/gallery'),
};
