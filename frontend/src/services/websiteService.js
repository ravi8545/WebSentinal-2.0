import api from './apiClient.js';

export async function listWebsites() {
  const { data } = await api.get('/websites');
  return data.websites;
}

export async function createWebsite({ name, url }) {
  const { data } = await api.post('/websites', { name, url });
  return data.website;
}

export async function updateWebsite(id, payload) {
  const { data } = await api.put(`/websites/${id}`, payload);
  return data.website;
}

export async function deleteWebsite(id) {
  await api.delete(`/websites/${id}`);
  return { ok: true };
}
