import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ticketAPI = {
  getAll: (params = {}) => api.get('/tickets/', { params }),
  getById: (id) => api.get(`/tickets/${id}/`),
  create: (data) => api.post('/tickets/', data),
  update: (id, data) => api.patch(`/tickets/${id}/`, data),
  classify: (description) => api.post('/tickets/classify/', { description }),
  getStats: () => api.get('/tickets/stats/'),
};
