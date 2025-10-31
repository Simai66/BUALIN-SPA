import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  verifyEmail: (token: string, email: string) =>
    api.get('/auth/verify', { params: { token, email } }),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  getMe: () => api.get('/auth/me'),
};

export const servicesAPI = {
  getAll: () => api.get('/services'),
};

export const promotionsAPI = {
  getAll: () => api.get('/promotions'),
};

export const therapistsAPI = {
  getAll: () => api.get('/therapists'),
};

export const adminAPI = {
  getDashboard: (params?: any) => api.get('/admin/dashboard', { params }),
  exportPDF: (params?: any) => api.get('/admin/export/pdf', { params, responseType: 'blob' }),
  exportExcel: (params?: any) => api.get('/admin/export/excel', { params, responseType: 'blob' }),
};

export const bookingsAPI = {
  getSlots: (params: { service_id: number; therapist_id: number; date: string }) =>
    api.get('/booking/slots', { params }),
  getAvailableDates: (params: { service_id: number; therapist_id: number }) =>
    api.get('/booking/available-dates', { params }),
  create: (data: { service_id: number; therapist_id: number; booking_datetime: string; promotion_id?: number; customer_phone: string; customer_name?: string }) =>
    api.post('/bookings', data),
  lookupByPhone: (phone: string) => api.get('/bookings/lookup', { params: { phone } }),
};

export default api;