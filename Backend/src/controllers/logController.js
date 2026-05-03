const Log = require('../models/Log');
const { serializeLog } = require('../utils/formatters');

async function listLogs(req, res, next) {
  try {
    const { type, limit } = req.query;
    const lim = Math.min(Number(limit) || 200, 1000);
    const logs = await Log.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(lim)
      .populate('website', 'name url');

    if (type === 'responseTime') {
      const points = logs
        .slice()
        .reverse()
        .map((l) => ({
          timestamp: l.createdAt,
          responseTime: l.responseTimeMs || 0,
          website: l.website?.name || l.target,
          target: l.target,
          state: l.state,
        }));
      return res.json({ points });
    }

    res.json({ logs: logs.map(serializeLog) });
  } catch (err) {
    next(err);
  }
}

module.exports = { listLogs };
