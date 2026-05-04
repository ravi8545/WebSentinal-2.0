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

  // Verify SMTP credentials once at startup so we get a clear log message
  // instead of silently failing on the first alert.
  transporter.verify((err) => {
    if (err) {
      console.error('[mailer] SMTP verify failed:', err.message);
    } else {
      console.log(`[mailer] SMTP ready (sending as ${user})`);
    }
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

function severityColor(sev) {
  return sev === 'critical' ? '#ef4444' : sev === 'warning' ? '#f59e0b' : '#22c55e';
}

function severityLabel(sev) {
  return (sev || 'info').toUpperCase();
}

function formatTs(ts) {
  const d = ts instanceof Date ? ts : ts ? new Date(ts) : new Date();
  return d.toUTCString();
}

function buildAlertEmail({
  severity,
  title,
  description,
  humanMessage,
  target,
  responseTimeMs,
  timestamp,
}) {
  const color = severityColor(severity);
  const ts = formatTs(timestamp);
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;background:#0b1220;color:#e2e8f0;padding:24px;border-radius:12px;max-width:600px;margin:auto;">
    <div style="border-left:4px solid ${color};padding:8px 16px;margin-bottom:16px;">
      <h2 style="margin:0 0 4px 0;color:${color};text-transform:uppercase;font-size:13px;letter-spacing:0.08em;">
        ${severityLabel(severity)} alert
      </h2>
      <h1 style="margin:0;color:#f8fafc;font-size:20px;">${title}</h1>
    </div>
    ${humanMessage ? `<p style="line-height:1.6;color:#f1f5f9;margin:0 0 12px 0;font-size:15px;">${humanMessage}</p>` : ''}
    ${description ? `<p style="line-height:1.6;color:#cbd5e1;margin:0 0 16px 0;">${description}</p>` : ''}
    <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:13px;color:#cbd5e1;">
      ${target ? `<tr><td style="padding:6px 0;color:#94a3b8;width:140px;">Website</td><td style="padding:6px 0;">${target}</td></tr>` : ''}
      ${responseTimeMs != null ? `<tr><td style="padding:6px 0;color:#94a3b8;">Response time</td><td style="padding:6px 0;">${responseTimeMs} ms</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:#94a3b8;">Severity</td><td style="padding:6px 0;color:${color};font-weight:600;">${severityLabel(severity)}</td></tr>
      <tr><td style="padding:6px 0;color:#94a3b8;">Timestamp (UTC)</td><td style="padding:6px 0;">${ts}</td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #1e293b;margin:20px 0;" />
    <p style="font-size:12px;color:#64748b;margin:0;">Sent by WebSentinal monitoring</p>
  </div>`;
  const text =
    `[${severityLabel(severity)}] ${title}\n` +
    (humanMessage ? `${humanMessage}\n` : '') +
    (description ? `${description}\n` : '') +
    (target ? `Target: ${target}\n` : '') +
    (responseTimeMs != null ? `Response time: ${responseTimeMs} ms\n` : '') +
    `Timestamp: ${ts}\n`;
  return { html, text };
}

function buildGroupedAlertEmail({ alerts }) {
  const total = alerts.length;
  const counts = alerts.reduce(
    (acc, a) => ((acc[a.severity] = (acc[a.severity] || 0) + 1), acc),
    {},
  );
  const banner = counts.critical
    ? { color: '#ef4444', label: 'CRITICAL' }
    : counts.warning
    ? { color: '#f59e0b', label: 'WARNING' }
    : { color: '#22c55e', label: 'INFO' };

  const rowsHtml = alerts
    .map((a) => {
      const c = severityColor(a.severity);
      return `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #1e293b;color:${c};font-weight:600;font-size:12px;">${severityLabel(a.severity)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #1e293b;color:#e2e8f0;font-size:13px;">${a.target}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #1e293b;color:#cbd5e1;font-size:13px;">${a.humanMessage || a.title}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:12px;text-align:right;">${a.responseTimeMs != null ? a.responseTimeMs + ' ms' : '—'}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:12px;">${formatTs(a.timestamp)}</td>
      </tr>`;
    })
    .join('');

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;background:#0b1220;color:#e2e8f0;padding:24px;border-radius:12px;max-width:760px;margin:auto;">
    <div style="border-left:4px solid ${banner.color};padding:8px 16px;margin-bottom:16px;">
      <h2 style="margin:0 0 4px 0;color:${banner.color};text-transform:uppercase;font-size:13px;letter-spacing:0.08em;">
        ${banner.label} digest
      </h2>
      <h1 style="margin:0;color:#f8fafc;font-size:20px;">${total} alerts grouped</h1>
    </div>
    <p style="margin:0 0 12px 0;color:#cbd5e1;">
      ${counts.critical ? `<span style="color:#ef4444;font-weight:600;">${counts.critical} critical</span>` : ''}
      ${counts.warning ? `${counts.critical ? ' · ' : ''}<span style="color:#f59e0b;font-weight:600;">${counts.warning} warning</span>` : ''}
      ${counts.info ? `${counts.critical || counts.warning ? ' · ' : ''}<span style="color:#22c55e;font-weight:600;">${counts.info} info</span>` : ''}
    </p>
    <table style="width:100%;border-collapse:collapse;margin-top:8px;">
      <thead>
        <tr style="text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;">
          <th style="padding:8px;border-bottom:1px solid #1e293b;">Sev</th>
          <th style="padding:8px;border-bottom:1px solid #1e293b;">Website</th>
          <th style="padding:8px;border-bottom:1px solid #1e293b;">Message</th>
          <th style="padding:8px;border-bottom:1px solid #1e293b;text-align:right;">RT</th>
          <th style="padding:8px;border-bottom:1px solid #1e293b;">When (UTC)</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <hr style="border:none;border-top:1px solid #1e293b;margin:20px 0;" />
    <p style="font-size:12px;color:#64748b;margin:0;">Sent by WebSentinal monitoring · grouped digest</p>
  </div>`;

  const text =
    `WebSentinal digest — ${total} alerts\n` +
    `${counts.critical || 0} critical · ${counts.warning || 0} warning · ${counts.info || 0} info\n\n` +
    alerts
      .map(
        (a) =>
          `[${severityLabel(a.severity)}] ${a.target} — ${a.humanMessage || a.title}` +
          (a.responseTimeMs != null ? ` (${a.responseTimeMs} ms)` : '') +
          ` @ ${formatTs(a.timestamp)}`,
      )
      .join('\n') +
    '\n';

  return { html, text };
}

module.exports = { sendMail, buildAlertEmail, buildGroupedAlertEmail };
