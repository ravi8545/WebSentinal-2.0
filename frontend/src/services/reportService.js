import api from './apiClient.js';

export async function fetchDashboard() {
  const { data } = await api.get('/dashboard');
  return data;
}

export async function fetchReports() {
  const { data } = await api.get('/reports');
  return data;
}
