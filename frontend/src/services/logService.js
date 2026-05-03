import api from './apiClient.js';

export async function listLogs() {
  const { data } = await api.get('/logs');
  return data.logs;
}
