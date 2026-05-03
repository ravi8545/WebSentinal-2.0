const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.EMAIL;
  const pass = process.env.APP_PASSWORD;
  if (!user || !pass) {
    console.warn('[mailer] EMAIL/APP_PASSWORD not set — email alerts disabled');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) return { ok: false, skipped: true };
  try {
    const info = await tx.sendMail({
      from: `"WebSentinal Alerts" <${process.env.EMAIL}>`,
      to,
      subject,
      text,
      html,
    });
    return { ok: true, id: info.messageId };
  } catch (err) {
    console.error('[mailer] failed to send:', err.message);
    return { ok: false, error: err.message };
  }
}

function buildAlertEmail({ severity, title, description, target, responseTimeMs }) {
  const color = severity === 'critical' ? '#ef4444' : severity === 'warning' ? '#f59e0b' : '#0ea5e9';
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;background:#0b1220;color:#e2e8f0;padding:24px;border-radius:12px;max-width:560px;margin:auto;">
    <div style="border-left:4px solid ${color};padding:8px 16px;margin-bottom:16px;">
      <h2 style="margin:0 0 4px 0;color:${color};text-transform:uppercase;font-size:13px;letter-spacing:0.08em;">
        ${severity} alert
      </h2>
      <h1 style="margin:0;color:#f8fafc;font-size:20px;">${title}</h1>
    </div>
    <p style="line-height:1.6;color:#cbd5e1;margin:0 0 12px 0;">${description || ''}</p>
    ${target ? `<p style="margin:0;color:#94a3b8;font-size:13px;"><strong>Target:</strong> ${target}</p>` : ''}
    ${responseTimeMs ? `<p style="margin:4px 0 0;color:#94a3b8;font-size:13px;"><strong>Response time:</strong> ${responseTimeMs} ms</p>` : ''}
    <hr style="border:none;border-top:1px solid #1e293b;margin:20px 0;" />
    <p style="font-size:12px;color:#64748b;margin:0;">Sent by WebSentinal monitoring · ${new Date().toUTCString()}</p>
  </div>`;
  const text = `[${severity.toUpperCase()}] ${title}\n${description || ''}\n${target ? 'Target: ' + target : ''}`;
  return { html, text };
}

module.exports = { sendMail, buildAlertEmail };
