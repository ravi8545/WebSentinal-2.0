import api from './apiClient.js';

export async function listAlerts() {
  const { data } = await api.get('/alerts');
  return data.alerts;
}

export async function markAllAlertsRead() {
  await api.post('/alerts/read-all');
  return { ok: true };
}
