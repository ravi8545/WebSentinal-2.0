const User = require('../models/User');

async function getIntegrations(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('emailIntegration email');
    const email = user?.emailIntegration || { connected: false, email: null };
    res.json({
      integrations: [
        {
          id: 'email',
          name: 'Email',
          description: 'Reliable email notifications when sites go down or get slow.',
          connected: Boolean(email.connected),
          email: email.email || user?.email || null,
        },
        { id: 'slack', name: 'Slack', description: 'Send alerts to your team channels.', connected: false },
        { id: 'discord', name: 'Discord', description: 'Pipe alerts into community servers.', connected: false },
        { id: 'webhooks', name: 'Webhooks', description: 'Connect any service via webhooks.', connected: false },
        { id: 'github', name: 'GitHub', description: 'Open issues automatically.', connected: false },
        { id: 'telegram', name: 'Telegram', description: 'Real-time alerts to Telegram chats.', connected: false },
      ],
    });
  } catch (err) {
    next(err);
  }
}

async function connectEmail(req, res, next) {
  try {
    const { email } = req.body || {};
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const target = (email && email.trim()) || user.email;
    if (!target) return res.status(400).json({ message: 'Email is required' });

    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(target)) return res.status(400).json({ message: 'Invalid email' });

    user.emailIntegration = {
      connected: true,
      email: target.toLowerCase(),
      connectedAt: new Date(),
    };
    await user.save();

    res.json({
      ok: true,
      integration: {
        id: 'email',
        name: 'Email',
        connected: true,
        email: user.emailIntegration.email,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function disconnectEmail(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.emailIntegration = { connected: false, email: null, connectedAt: null };
    await user.save();
    res.json({ ok: true, integration: { id: 'email', name: 'Email', connected: false } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getIntegrations, connectEmail, disconnectEmail };
