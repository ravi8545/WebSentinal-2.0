const Website = require('../models/Website');
const Log = require('../models/Log');
const Alert = require('../models/Alert');

function dayLabel(d) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
}

async function getReports(req, res, next) {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [sites, logs, alerts] = await Promise.all([
      Website.find({ user: req.user._id }),
      Log.find({ user: req.user._id, createdAt: { $gte: since } }),
      Alert.find({ user: req.user._id, createdAt: { $gte: since }, severity: { $in: ['critical', 'warning'] } }),
    ]);

    const totalChecks = logs.length;
    const okChecks = logs.filter((l) => l.state === 'Up').length;
    const avgResponse = totalChecks
      ? Math.round(logs.reduce((s, l) => s + (l.responseTimeMs || 0), 0) / totalChecks)
      : 0;
    const avgUptime = totalChecks ? (okChecks / totalChecks) * 100 : 100;
    const incidents = alerts.length;

    // MTTR placeholder = average outage span in minutes (stub: incidents avg of 12 mins)
    const mttrMinutes = incidents ? 12 : 0;

    const reportKpis = [
      { id: 'r1', label: 'Avg Response', value: avgResponse ? `${avgResponse} ms` : '—', change: '7d window', tone: 'success' },
      { id: 'r2', label: 'Avg Uptime', value: `${avgUptime.toFixed(2)}%`, change: '7d window', tone: avgUptime >= 99 ? 'success' : 'warning' },
      { id: 'r3', label: 'Total Incidents', value: incidents, change: '7d window', tone: incidents ? 'warning' : 'success' },
      { id: 'r4', label: 'MTTR', value: mttrMinutes ? `${mttrMinutes}m 0s` : '—', change: '7d window', tone: 'success' },
    ];

    // Daily availability bars
    const buckets = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { label: dayLabel(d), ok: 0, total: 0 };
    }
    logs.forEach((l) => {
      const key = new Date(l.createdAt).toISOString().slice(0, 10);
      if (!buckets[key]) return;
      buckets[key].total += 1;
      if (l.state === 'Up') buckets[key].ok += 1;
    });
    const reportBars = Object.values(buckets).map((b) => ({
      label: b.label,
      value: b.total ? Math.round((b.ok / b.total) * 100) : 100,
    }));

    // Status page services
    const statusServices = sites.map((s) => {
      const uptime = s.totalChecks ? (s.successfulChecks / s.totalChecks) * 100 : 100;
      let status = 'Operational';
      let tone = 'success';
      if (s.status === 'Down') { status = 'Down'; tone = 'danger'; }
      else if (s.status === 'Slow') { status = 'Degraded'; tone = 'warning'; }
      return {
        id: s._id.toString(),
        name: s.name,
        uptime: Math.round(uptime * 100) / 100,
        status,
        tone,
      };
    });

    const statusIncidents = alerts.slice(0, 10).map((a) => ({
      id: a._id.toString(),
      date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title: a.title,
      description: a.description,
      tone: a.severity === 'critical' ? 'danger' : 'warning',
    }));

    res.json({ reportKpis, reportBars, statusServices, statusIncidents });
  } catch (err) {
    next(err);
  }
}

module.exports = { getReports };
