import api from './api';

export interface SellerPayment {
  id?: number;
  user_id?: number;
  mobile_booking_id: number;
  seller_name: string;
  payment_amount: number;
  payment_date: string;
  received_by_account_type?: 'credit_card' | 'friend' | 'bank_account';
  received_by_credit_card_id?: number;
  received_by_friend_id?: number;
  received_by_account_name?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Joined fields from mobile_bookings
  phone_name?: string;
  variant?: string;
  color?: string;
  booking_date?: string;
  booking_amount?: number;
  card_name?: string;
  friend_name?: string;
  platform_name?: string;
}

export interface SellerPaymentFilters {
  mobile_booking_id?: number;
  seller_name?: string;
  start_date?: string;
  end_date?: string;
}

class SellerPaymentService {
  async getAll(filters?: SellerPaymentFilters): Promise<{ payments: SellerPayment[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.mobile_booking_id) {
      params.append('mobile_booking_id', filters.mobile_booking_id.toString());
    }
    if (filters?.seller_name) {
      params.append('seller_name', filters.seller_name);
    }
    if (filters?.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      params.append('end_date', filters.end_date);
    }

    const queryString = params.toString();
    const response = await api.get(`/api/seller-payments${queryString ? `?${queryString}` : ''}`);
    return response.data;
  }

  async getById(id: number): Promise<{ payment: SellerPayment }> {
    const response = await api.get(`/api/seller-payments/${id}`);
    return response.data;
  }

  async add(payment: SellerPayment): Promise<{ message: string; payment: SellerPayment }> {
    const response = await api.post('/api/seller-payments', payment);
    return response.data;
  }

  async update(id: number, payment: Partial<SellerPayment>): Promise<{ message: string; payment: SellerPayment }> {
    const response = await api.put(`/api/seller-payments/${id}`, payment);
    return response.data;
  }

  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/api/seller-payments/${id}`);
    return response.data;
  }
}

export const sellerPaymentService = new SellerPaymentService();
