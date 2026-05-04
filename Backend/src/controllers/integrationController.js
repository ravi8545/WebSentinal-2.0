const User = require('../models/User');
const { sendMail, buildAlertEmail } = require('../services/mailer');

async function getIntegrations(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('emailIntegration email');
    const email = user?.emailIntegration || {};
    // Email is enabled by default unless explicitly disconnected by the user.
    const emailConnected = email.connected !== false;
    res.json({
      integrations: [
        {
          id: 'email',
          name: 'Email',
          description: 'Reliable email notifications when sites go down or get slow.',
          connected: emailConnected,
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

async function sendTestEmail(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('emailIntegration email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const explicitlyDisabled = user.emailIntegration?.connected === false;
    const recipient = !explicitlyDisabled
      ? user.emailIntegration?.email || user.email
      : null;
    if (!recipient) {
      return res.status(400).json({
        message: 'Email integration is disconnected. Click Connect first.',
      });
    }

    const { html, text } = buildAlertEmail({
      severity: 'info',
      title: 'Test alert from WebSentinal',
      description:
        'This is a test message confirming that email alerts are working for your account.',
      target: 'websentinal-test',
      responseTimeMs: 0,
    });

    const result = await sendMail({
      to: recipient,
      subject: '[WebSentinal] Test alert',
      html,
      text,
    });

    if (result?.ok) {
      return res.json({ ok: true, sentTo: recipient, messageId: result.id });
    }
    if (result?.skipped) {
      return res.status(500).json({
        message: 'Mailer not configured: EMAIL / APP_PASSWORD missing on the server.',
      });
    }
    return res.status(500).json({
      message: result?.error || 'Failed to send test email',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getIntegrations, connectEmail, disconnectEmail, sendTestEmail };
