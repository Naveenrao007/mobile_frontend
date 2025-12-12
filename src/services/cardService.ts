import api from './api';

export interface CreditCard {
  id?: number;
  friend_id?: number;
  partner_id?: number;
  card_name: string;
  card_number: string;
  expiry_mm: string;
  expiry_yy: string;
  cvv: string;
  card_number_last4?: string;
  card_type?: 'visa' | 'mastercard' | 'rupay' | 'unknown';
  card_category?: 'credit' | 'debit';
  bank_name?: string;
  limit_type: 'monthly' | 'quarterly' | 'yearly' | 'none';
  limit_amount?: number;
  limit_period_start?: string;
  current_period_start?: string;
  current_period_end?: string;
  notes?: string;
}

export const cardService = {
  getAll: async () => {
    const response = await api.get('/api/cards');
    return response.data;
  },

  getByFriend: async (friendId: number) => {
    const response = await api.get(`/api/cards/friend/${friendId}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/cards/${id}`);
    return response.data;
  },

  add: async (card: CreditCard) => {
    const response = await api.post('/api/cards', card);
    return response.data;
  },

  update: async (id: number, card: Partial<CreditCard>) => {
    const response = await api.put(`/api/cards/${id}`, card);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/cards/${id}`);
    return response.data;
  },
};

