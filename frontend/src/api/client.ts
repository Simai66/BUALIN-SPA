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
  // CRUD: Services
  getServices: () => api.get('/admin/services'),
  createService: (data: any) => api.post('/admin/services', data),
  updateService: (id: number, data: any) => api.put(`/admin/services/${id}`, data),
  deleteService: (id: number) => api.delete(`/admin/services/${id}`),
  // CRUD: Therapists
  getTherapists: () => api.get('/admin/therapists'),
  createTherapist: (data: any) => api.post('/admin/therapists', data),
  updateTherapist: (id: number, data: any) => api.put(`/admin/therapists/${id}`, data),
  deleteTherapist: (id: number) => api.delete(`/admin/therapists/${id}`),
  // CRUD: Users
  getUsers: () => api.get('/admin/users'),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  // Days Off: Therapists
  getDaysOff: (params?: { month?: string; therapist_id?: number }) =>
    api.get('/admin/days-off', { params }),
  createDayOff: (data: { therapist_id: number; day_off: string; note?: string }) =>
    api.post('/admin/days-off', data),
  deleteDayOff: (id: number) => api.delete(`/admin/days-off/${id}`),
};

export const bookingsAPI = {
  list: (params?: { start?: string; end?: string; status?: string; service_id?: number; therapist_id?: number }) =>
    api.get('/bookings', { params }),
  getSlots: (params: { service_id: number; therapist_id: number; date: string }) =>
    api.get('/booking/slots', { params }),
  getAvailableDates: (params: { service_id: number; therapist_id: number }) =>
    api.get('/booking/available-dates', { params }),
  create: (data: { service_id: number; therapist_id: number; booking_datetime: string; promotion_id?: number; customer_phone: string; customer_name?: string }) =>
    api.post('/bookings', data),
  lookupByPhone: (phone: string) => api.get('/bookings/lookup', { params: { phone } }),
};

export default api;