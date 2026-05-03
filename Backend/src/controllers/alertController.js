const Alert = require('../models/Alert');
const { serializeAlert } = require('../utils/formatters');

async function listAlerts(req, res, next) {
  try {
    const alerts = await Alert.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ alerts: alerts.map(serializeAlert) });
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await Alert.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listAlerts, markAllRead };
