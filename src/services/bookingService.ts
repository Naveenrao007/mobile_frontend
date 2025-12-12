import api from './api';

export interface MobileBooking {
  id?: number;
  platform_id: number;
  credit_card_id: number;
  phone_name: string;
  variant?: string;
  color?: string;
  net_amount: number;
  supercoin_amount?: number;
  gift_card_amount?: number;
  cashback_amount?: number;
  cashback_percentage?: number;
  is_emi?: boolean;
  emi_cancellation_charge?: number;
  partner_id?: number;
  booking_date?: string;
  notes?: string;
  selling_price?: number;
  buyer_name?: string;
  payment_received_by?: string;
  payment_received_amount?: number;
  selling_date?: string;
  status?: 'booked' | 'received' | 'sold' | 'cancelled';
}

export const bookingService = {
  getAll: async () => {
    const response = await api.get('/api/bookings');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data;
  },

  add: async (booking: MobileBooking) => {
    const response = await api.post('/api/bookings', booking);
    return response.data;
  },

  update: async (id: number, booking: Partial<MobileBooking>) => {
    const response = await api.put(`/api/bookings/${id}`, booking);
    return response.data;
  },
};

