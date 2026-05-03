const Website = require('../models/Website');
const Log = require('../models/Log');
const Alert = require('../models/Alert');
const { ensureProtocol, stripProtocol, serializeWebsite } = require('../utils/formatters');
const { checkWebsite } = require('../services/monitor');

async function listWebsites(req, res, next) {
  try {
    const sites = await Website.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ websites: sites.map(serializeWebsite) });
  } catch (err) {
    next(err);
  }
}

async function createWebsite(req, res, next) {
  try {
    const { name, url } = req.body;
    if (!url) return res.status(400).json({ message: 'URL is required' });

    const fullUrl = ensureProtocol(url.trim());
    const cleanName = (name && name.trim()) || stripProtocol(fullUrl);

    const site = await Website.create({
      user: req.user._id,
      name: cleanName,
      url: fullUrl,
    });

    await Alert.create({
      user: req.user._id,
      website: site._id,
      severity: 'info',
      title: 'New monitor added',
      description: `${stripProtocol(fullUrl)} is now being monitored.`,
    });

    // Fire an immediate background check (no await blocking the response)
    checkWebsite(site).catch(() => {});

    res.status(201).json({ website: serializeWebsite(site) });
  } catch (err) {
    next(err);
  }
}

async function deleteWebsite(req, res, next) {
  try {
    const site = await Website.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!site) return res.status(404).json({ message: 'Website not found' });

    await Promise.all([
      Log.deleteMany({ website: site._id }),
      Alert.deleteMany({ website: site._id }),
    ]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function updateWebsite(req, res, next) {
  try {
    const { name, url } = req.body;
    const site = await Website.findOne({ _id: req.params.id, user: req.user._id });
    if (!site) return res.status(404).json({ message: 'Website not found' });

    if (name) site.name = name.trim();
    if (url) site.url = ensureProtocol(url.trim());
    await site.save();

    res.json({ website: serializeWebsite(site) });
  } catch (err) {
    next(err);
  }
}

module.exports = { listWebsites, createWebsite, deleteWebsite, updateWebsite };
