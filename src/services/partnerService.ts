import api from './api';

export interface Partner {
  id: number;
  name: string;
  email?: string;
  mobile?: string;
  share_percentage: number;
}

export const partnerService = {
  getAll: async () => {
    const response = await api.get('/api/partners');
    return response.data;
  },
};

