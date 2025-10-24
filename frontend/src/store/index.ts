import { create } from 'zustand';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

interface BookingStore {
  selectedService: any;
  selectedTherapist: any;
  selectedDatetime: Date | null;
  setService: (service: any) => void;
  setTherapist: (therapist: any) => void;
  setDatetime: (datetime: Date | null) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  selectedService: null,
  selectedTherapist: null,
  selectedDatetime: null,
  setService: (service) => set({ selectedService: service }),
  setTherapist: (therapist) => set({ selectedTherapist: therapist }),
  setDatetime: (datetime) => set({ selectedDatetime: datetime }),
  reset: () => set({ 
    selectedService: null, 
    selectedTherapist: null, 
    selectedDatetime: null 
  }),
}));
