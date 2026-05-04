/**
 * AlertService
 * ------------
 * Production-grade smart alerting:
 *   1. State-based:   only fires on real status transitions.
 *   2. Cooldown:      suppresses repeats inside a configurable window.
 *   3. Severity:      info / warning / critical.
 *   4. Grouping:      buffers events per-user and flushes a single
 *                     summary email if multiple alerts arrive close together.
 *   5. Confirmation:  optional N consecutive failures before firing,
 *                     to absorb single-tick blips.
 *
 * Environment knobs (all optional):
 *   ALERT_COOLDOWN_MS         default 300_000   (5 min per-site cooldown)
 *   ALERT_GROUP_FLUSH_MS      default 30_000    (group window)
 *   ALERT_FAILURE_THRESHOLD   default 1         (consecutive bad checks before alerting)
 *
 * Scalability notes (see bottom of file).
 */

const Alert = require('../models/Alert');
const User = require('../models/User');
const { sendMail, buildAlertEmail, buildGroupedAlertEmail } = require('./mailer');
const { stripProtocol } = require('../utils/formatters');

const DEFAULT_COOLDOWN_MS = Number(process.env.ALERT_COOLDOWN_MS || 5 * 60_000);
const GROUP_FLUSH_MS = Number(process.env.ALERT_GROUP_FLUSH_MS || 30_000);
const FAILURE_CONFIRM_THRESHOLD = Number(process.env.ALERT_FAILURE_THRESHOLD || 1);

// ---------- pure helpers ----------------------------------------------------

const SEVERITY_BY_STATE = {
  Down: 'critical',
  Slow: 'warning',
  Up: 'info',
};

/**
 * Decide if a transition is alert-worthy.
 *   Up    -> Down   ✓   (critical)
 *   Up    -> Slow   ✓   (warning)
 *   Slow  -> Down   ✓   (escalation)
 *   Down  -> Slow   ✓   (partial recovery)
 *   Down  -> Up     ✓   (recovery)
 *   Slow  -> Up     ✓   (recovery)
 *   Down  -> Down   ✗   (suppress; cooldown handles re-alert if needed)
 *   Slow  -> Slow   ✗
 *   Up    -> Up     ✗
 *   Pending -> Up   ✗   (first successful check, nothing to recover from)
 *   Pending -> Down ✓
 *   Pending -> Slow ✓
 */
function shouldAlert(prev, next) {
  if (!next) return false;
  if (!prev || prev === 'Pending') {
    return next === 'Down' || next === 'Slow';
  }
  return prev !== next;
}

function severityFor(next) {
  return SEVERITY_BY_STATE[next] || 'info';
}

function buildAlertContent({ prev, next, target, responseTimeMs, message, slowThresholdMs }) {
  if (next === 'Down') {
    return {
      title: `${target} is DOWN`,
      description: `Service unreachable: ${message || 'no response'}.`,
      humanMessage: `🚨 ${target} appears to be DOWN. Reason: ${message || 'no response'}.`,
    };
  }
  if (next === 'Slow') {
    return {
      title: `${target} is responding slowly`,
      description: `Response time ${responseTimeMs} ms exceeded ${slowThresholdMs} ms threshold.`,
      humanMessage: `⚠️ ${target} is slow (${responseTimeMs} ms, threshold ${slowThresholdMs} ms).`,
    };
  }
  if (next === 'Up' && (prev === 'Down' || prev === 'Slow')) {
    return {
      title: `${target} has RECOVERED`,
      description: `Service is back to normal (response time ${responseTimeMs} ms).`,
      humanMessage: `✅ ${target} recovered. Response time ${responseTimeMs} ms.`,
    };
  }
  return null;
}

// ---------- per-user grouping buffer ----------------------------------------

const buffers = new Map(); // userId -> { alerts: [], timer }

function enqueueAlert(userId, item) {
  const key = userId.toString();
  let buf = buffers.get(key);
  if (!buf) {
    buf = { alerts: [], timer: null };
    buffers.set(key, buf);
  }
  buf.alerts.push(item);

  if (!buf.timer) {
    buf.timer = setTimeout(() => {
      flushUser(key).catch((e) =>
        console.error('[alertService] flush error', e.message),
      );
    }, GROUP_FLUSH_MS);
    if (typeof buf.timer.unref === 'function') buf.timer.unref();
  }
}

async function flushUser(userId) {
  const buf = buffers.get(userId);
  if (!buf) return;
  buffers.delete(userId);
  if (buf.timer) clearTimeout(buf.timer);
  if (!buf.alerts.length) return;

  const owner = await User.findById(userId).select('emailIntegration email');
  if (!owner) return;
  const explicitlyDisabled =
    owner.emailIntegration && owner.emailIntegration.connected === false;
  const recipient = !explicitlyDisabled
    ? owner.emailIntegration?.email || owner.email
    : null;
  if (!recipient) {
    console.warn(
      `[alertService] no email recipient for user ${userId} (${buf.alerts.length} pending)`,
    );
    return;
  }

  const alerts = buf.alerts;

  try {
    if (alerts.length === 1) {
      const a = alerts[0];
      const { html, text } = buildAlertEmail({
        severity: a.severity,
        title: a.title,
        description: a.description,
        humanMessage: a.humanMessage,
        target: a.target,
        responseTimeMs: a.responseTimeMs,
        timestamp: a.timestamp,
      });
      const subject = `[WebSentinal][${a.severity.toUpperCase()}] ${a.title}`;
      const result = await sendMail({ to: recipient, subject, html, text });
      if (result?.ok) {
        console.log(`[alertService] sent ${a.severity} alert to ${recipient} (${a.title})`);
      } else if (result?.error) {
        console.error('[alertService] send failed:', result.error);
      }
    } else {
      const { html, text } = buildGroupedAlertEmail({ alerts });
      const highest = alerts.some((a) => a.severity === 'critical')
        ? 'CRITICAL'
        : alerts.some((a) => a.severity === 'warning')
        ? 'WARNING'
        : 'INFO';
      const subject = `[WebSentinal][${highest}] ${alerts.length} alerts in last ${Math.round(
        GROUP_FLUSH_MS / 1000,
      )}s`;
      const result = await sendMail({ to: recipient, subject, html, text });
      if (result?.ok) {
        console.log(
          `[alertService] sent grouped digest (${alerts.length} events) to ${recipient}`,
        );
      } else if (result?.error) {
        console.error('[alertService] grouped send failed:', result.error);
      }
    }
  } catch (e) {
    console.error('[alertService] flush failed:', e.message);
  }
}

// ---------- main entrypoint -------------------------------------------------

/**
 * Process a freshly evaluated check.
 *
 * IMPORTANT: caller must persist (`site.save()`) AFTER this call — we mutate
 * `site.lastAlertSentAt`, `site.lastStatus`, `site.consecutiveFailures` here
 * but do not save, so the monitor can batch one save per tick.
 *
 * @returns {Promise<Alert|null>} the persisted Alert document, or null if suppressed.
 */
async function processCheck({
  site,
  newState,
  previousStatus,
  responseTimeMs,
  message,
  slowThresholdMs,
}) {
  // 1. Update consecutive failure counter.
  if (newState === 'Down' || newState === 'Slow') {
    site.consecutiveFailures = (site.consecutiveFailures || 0) + 1;
  } else {
    site.consecutiveFailures = 0;
  }

  // 2. Always remember what state we observed last tick.
  site.lastStatus = previousStatus || site.lastStatus || 'Pending';

  // 3. Decide whether this transition warrants an alert.
  if (!shouldAlert(previousStatus, newState)) return null;

  // 4. Confirmation threshold: ignore single-tick blips for bad states.
  if (
    (newState === 'Down' || newState === 'Slow') &&
    site.consecutiveFailures < FAILURE_CONFIRM_THRESHOLD
  ) {
    return null;
  }

  // 5. Cooldown: only suppress *bad-state* re-alerts. Recovery always fires.
  const cooldown = site.alertCooldownMs || DEFAULT_COOLDOWN_MS;
  const now = Date.now();
  if (
    (newState === 'Down' || newState === 'Slow') &&
    site.lastAlertSentAt &&
    now - new Date(site.lastAlertSentAt).getTime() < cooldown
  ) {
    return null;
  }

  const target = stripProtocol(site.url);
  const content = buildAlertContent({
    prev: previousStatus,
    next: newState,
    target,
    responseTimeMs,
    message,
    slowThresholdMs,
  });
  if (!content) return null;

  const severity = severityFor(newState);

  // 6. Persist the alert (audit trail / in-app notifications).
  const alertDoc = await Alert.create({
    user: site.user,
    website: site._id,
    severity,
    title: content.title,
    description: content.description,
  });

  // 7. Update site bookkeeping (caller will save).
  site.lastAlertSentAt = new Date();

  // 8. Enqueue for grouped delivery.
  enqueueAlert(site.user.toString(), {
    alertId: alertDoc._id,
    severity,
    state: newState,
    prevState: previousStatus,
    target,
    responseTimeMs,
    timestamp: new Date(),
    title: content.title,
    description: content.description,
    humanMessage: content.humanMessage,
  });

  return alertDoc;
}

// Optional: force-flush every user buffer (used at shutdown).
async function flushAll() {
  const ids = Array.from(buffers.keys());
  await Promise.all(ids.map((id) => flushUser(id).catch(() => {})));
}

module.exports = {
  processCheck,
  flushAll,
  // exported for unit tests
  _internals: { shouldAlert, severityFor, buildAlertContent },
};

/* -----------------------------------------------------------------------------
 * SCALABILITY NOTES
 * -----------------------------------------------------------------------------
 *  - The grouping buffer here is *in-memory* and per-process. That is fine for a
 *    single Node instance. For multi-instance deploys, replace `buffers` with a
 *    shared store:
 *
 *      • Redis lists keyed by `alerts:user:<id>` with TTL,
 *        flushed by a single worker via BLPOP or a Redis Streams consumer group.
 *      • Or push events onto BullMQ / RabbitMQ / SQS and have a dedicated
 *        "notifier" worker dequeue and email.
 *
 *  - Mongo writes are O(checks). For large fleets, batch Log inserts
 *    (`insertMany`) and use `bulkWrite` for site updates.
 *
 *  - Outbound email should ride a queue (BullMQ + Redis) so SMTP latency does
 *    not block the monitor loop, and so retries/backoff are first-class.
 *
 *  - Cooldown state lives on the Website document today. For very high write
 *    volume, move `lastAlertSentAt` to Redis with `SET ... EX <cooldownSec> NX`
 *    — this gives you atomic dedup without a DB round-trip.
 *
 *  - For multi-channel delivery (Slack/Discord/Webhooks), make `sendMail` one
 *    of N channel adapters behind a `Notifier` interface; AlertService stays
 *    transport-agnostic.
 * --------------------------------------------------------------------------- */
