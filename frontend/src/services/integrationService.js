import api from './apiClient.js';

export async function listIntegrations() {
  const { data } = await api.get('/integrations');
  return data.integrations;
}

export async function connectEmailIntegration(email) {
  const { data } = await api.post('/integrations/email/connect', email ? { email } : {});
  return data.integration;
}

export async function disconnectEmailIntegration() {
  const { data } = await api.post('/integrations/email/disconnect');
  return data.integration;
}
