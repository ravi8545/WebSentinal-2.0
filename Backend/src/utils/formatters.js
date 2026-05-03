function normalizeUrl(input = '') {
  return String(input).trim().replace(/\/$/, '');
}

function ensureProtocol(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function stripProtocol(url = '') {
  return String(url).replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

function statusToTone(status) {
  if (status === 'Up') return 'success';
  if (status === 'Down') return 'danger';
  if (status === 'Slow') return 'warning';
  return 'accent';
}

function severityToTone(severity) {
  if (severity === 'critical') return 'danger';
  if (severity === 'warning') return 'warning';
  return 'accent';
}

function timeAgo(date) {
  if (!date) return '—';
  const d = new Date(date);
  const diff = Math.max(0, Date.now() - d.getTime());
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec} sec ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const days = Math.floor(hr / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function formatResponseTime(ms) {
  if (!ms || ms <= 0) return '—';
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  return `${Math.round(ms)} ms`;
}

function formatUptime(percent) {
  if (percent === null || percent === undefined) return '100.00%';
  return `${Number(percent).toFixed(2)}%`;
}

function serializeWebsite(doc) {
  const w = doc.toObject ? doc.toObject() : doc;
  const status = w.status || 'Pending';
  return {
    id: w._id?.toString() || w.id,
    name: w.name,
    url: stripProtocol(w.url),
    rawUrl: w.url,
    status,
    tone: statusToTone(status),
    responseTime: formatResponseTime(w.responseTimeMs),
    responseTimeMs: w.responseTimeMs || 0,
    uptime: formatUptime(w.uptimePercent),
    uptimePercent: Number((w.uptimePercent ?? 100).toFixed(2)),
    lastChecked: w.lastChecked ? timeAgo(w.lastChecked) : 'just added',
    createdAt: w.createdAt,
  };
}

function serializeAlert(doc) {
  const a = doc.toObject ? doc.toObject() : doc;
  return {
    id: a._id?.toString() || a.id,
    severity: a.severity,
    title: a.title,
    description: a.description,
    time: timeAgo(a.createdAt),
    tone: severityToTone(a.severity),
    read: a.read,
  };
}

function serializeLog(doc) {
  const l = doc.toObject ? doc.toObject() : doc;
  return {
    id: l._id?.toString() || l.id,
    timestamp: new Date(l.createdAt).toISOString().replace('T', ' ').slice(0, 19),
    target: l.target,
    status: l.statusCode,
    responseTime: formatResponseTime(l.responseTimeMs),
    message: l.message,
    tone: statusToTone(l.state),
  };
}

module.exports = {
  normalizeUrl,
  ensureProtocol,
  stripProtocol,
  statusToTone,
  severityToTone,
  timeAgo,
  formatResponseTime,
  formatUptime,
  serializeWebsite,
  serializeAlert,
  serializeLog,
};
