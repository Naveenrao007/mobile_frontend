import api from './api';

export interface Friend {
  id?: number;
  name: string;
  email?: string;
  mobile?: string;
  notes?: string;
  partner_id?: number;
}

export const friendService = {
  getAll: async (partnerId?: number | null) => {
    const params: any = {};
    if (partnerId) {
      params.partner_id = partnerId;
    }
    const response = await api.get('/api/friends', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/friends/${id}`);
    return response.data;
  },

  add: async (friend: Friend) => {
    const response = await api.post('/api/friends', friend);
    return response.data;
  },

  update: async (id: number, friend: Friend) => {
    const response = await api.put(`/api/friends/${id}`, friend);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/friends/${id}`);
    return response.data;
  },
};

