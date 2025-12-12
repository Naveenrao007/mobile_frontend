import api from './api';

export interface Platform {
  id?: number;
  name: string;
  is_active?: boolean;
}

export const platformService = {
  getAll: async () => {
    const response = await api.get('/api/platforms');
    return response.data;
  },

  add: async (platform: Platform) => {
    const response = await api.post('/api/platforms', platform);
    return response.data;
  },

  update: async (id: number, platform: Partial<Platform>) => {
    const response = await api.put(`/api/platforms/${id}`, platform);
    return response.data;
  },
};

