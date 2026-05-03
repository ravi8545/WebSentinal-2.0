const Website = require('../models/Website');
const Log = require('../models/Log');
const Alert = require('../models/Alert');
const { serializeAlert } = require('../utils/formatters');

function dayLabel(d) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
}

async function getDashboard(req, res, next) {
  try {
    const sites = await Website.find({ user: req.user._id });

    const total = sites.length;
    let up = 0;
    let down = 0;
    let slow = 0;
    let totalChecks = 0;
    let okChecks = 0;

    sites.forEach((s) => {
      if (s.status === 'Up') up += 1;
      else if (s.status === 'Down') down += 1;
      else if (s.status === 'Slow') slow += 1;
      totalChecks += s.totalChecks || 0;
      okChecks += s.successfulChecks || 0;
    });

    const overallUptime = totalChecks ? (okChecks / totalChecks) * 100 : 100;
    const healthyPct = total ? Math.round((up / total) * 1000) / 10 : 0;

    const stats = [
      { id: 'websites', label: 'Total Websites', value: total, change: 'Currently monitored', tone: 'accent' },
      { id: 'up', label: 'Up', value: up, change: total ? `${healthyPct}% healthy` : 'No monitors yet', tone: 'success' },
      { id: 'down', label: 'Down', value: down, change: down ? 'Needs attention' : 'All clear', tone: 'danger' },
      { id: 'slow', label: 'Slow', value: slow, change: slow ? 'Latency rising' : 'Stable', tone: 'warning' },
    ];

    const uptimeBreakdown = total
      ? [
          { label: 'Up', value: Math.round((up / total) * 100), tone: 'success' },
          { label: 'Down', value: Math.round((down / total) * 100), tone: 'danger' },
          { label: 'Slow', value: Math.round((slow / total) * 100), tone: 'warning' },
        ]
      : [
          { label: 'Up', value: 100, tone: 'success' },
          { label: 'Down', value: 0, tone: 'danger' },
          { label: 'Slow', value: 0, tone: 'warning' },
        ];

    // Last 7 days response time average
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const logs = await Log.find({ user: req.user._id, createdAt: { $gte: since } });

    const buckets = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { label: dayLabel(d), sum: 0, count: 0 };
    }
    logs.forEach((l) => {
      const key = new Date(l.createdAt).toISOString().slice(0, 10);
      if (buckets[key] && l.responseTimeMs) {
        buckets[key].sum += l.responseTimeMs;
        buckets[key].count += 1;
      }
    });
    const responseTimes = Object.values(buckets).map((b) => ({
      label: b.label,
      value: b.count ? Math.round(b.sum / b.count) : 0,
    }));

    const recentAlertDocs = await Alert.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3);
    const recentAlerts = recentAlertDocs.map((a) => {
      const s = serializeAlert(a);
      return { id: s.id, title: s.title, description: s.description, tone: s.tone };
    });

    const activityLogs = (await Log.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5))
      .map((l) => ({
        id: l._id.toString(),
        label: l.state === 'Up' ? 'Check passed' : l.state === 'Slow' ? 'Latency alert' : 'Incident detected',
        detail: `${l.target} — ${l.message}`,
        time: timeAgoShort(l.createdAt),
      }));

    res.json({
      stats,
      uptimeBreakdown,
      uptimePercent: Math.round(overallUptime * 100) / 100,
      responseTimes,
      recentAlerts,
      activityLogs,
      aiSummary: buildAiSummary({ down, slow, total }),
    });
  } catch (err) {
    next(err);
  }
}

function timeAgoShort(date) {
  const diff = Math.max(0, Date.now() - new Date(date).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function buildAiSummary({ down, slow, total }) {
  if (!total) return 'No monitors yet. Add a website to start tracking uptime.';
  if (!down && !slow) return `All ${total} monitored services are operating normally.`;
  const parts = [];
  if (down) parts.push(`${down} endpoint${down > 1 ? 's are' : ' is'} down`);
  if (slow) parts.push(`${slow} responding slowly`);
  return `${parts.join(' and ')} across your monitored services. Investigate to restore healthy operation.`;
}

module.exports = { getDashboard };
