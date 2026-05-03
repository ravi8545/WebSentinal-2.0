const axios = require('axios');
const Website = require('../models/Website');
const Log = require('../models/Log');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { stripProtocol } = require('../utils/formatters');
const { sendMail, buildAlertEmail } = require('./mailer');

const CHECK_INTERVAL_MS = Number(process.env.MONITOR_INTERVAL_MS || 60_000); // 60s
const SLOW_THRESHOLD_MS = Number(process.env.MONITOR_SLOW_MS || 800);
const REQUEST_TIMEOUT_MS = Number(process.env.MONITOR_TIMEOUT_MS || 10_000);

async function checkWebsite(site) {
  const url = site.url;
  const target = stripProtocol(url);
  const started = Date.now();

  let statusCode = 0;
  let responseTimeMs = 0;
  let state = 'Up';
  let message = 'OK';
  let isSuccess = false;

  try {
    const res = await axios.get(url, {
      timeout: REQUEST_TIMEOUT_MS,
      validateStatus: () => true,
      maxRedirects: 5,
      headers: { 'User-Agent': 'WebSentinal-Monitor/1.0' },
    });
    responseTimeMs = Date.now() - started;
    statusCode = res.status;

    if (res.status >= 200 && res.status < 400) {
      isSuccess = true;
      if (responseTimeMs >= SLOW_THRESHOLD_MS) {
        state = 'Slow';
        message = `OK (slow response ${responseTimeMs} ms)`;
      } else {
        state = 'Up';
        message = `OK ${res.status}`;
      }
    } else {
      state = 'Down';
      message = `HTTP ${res.status}`;
    }
  } catch (err) {
    responseTimeMs = Date.now() - started;
    statusCode = 0;
    state = 'Down';
    message = err.code || err.message || 'Request failed';
  }

  const previousStatus = site.status;

  site.status = state;
  site.responseTimeMs = responseTimeMs;
  site.lastChecked = new Date();
  site.totalChecks = (site.totalChecks || 0) + 1;
  if (isSuccess) site.successfulChecks = (site.successfulChecks || 0) + 1;
  await site.save();

  await Log.create({
    user: site.user,
    website: site._id,
    target,
    statusCode,
    responseTimeMs,
    message,
    state,
  });

  // Generate alerts on state transitions
  if (previousStatus && previousStatus !== state) {
    let alertDoc = null;
    if (state === 'Down') {
      alertDoc = await Alert.create({
        user: site.user,
        website: site._id,
        severity: 'critical',
        title: `${target} is down`,
        description: message,
      });
    } else if (state === 'Slow') {
      alertDoc = await Alert.create({
        user: site.user,
        website: site._id,
        severity: 'warning',
        title: `${target} latency rising`,
        description: `Response time exceeded ${SLOW_THRESHOLD_MS} ms (${responseTimeMs} ms).`,
      });
    } else if (state === 'Up' && (previousStatus === 'Down' || previousStatus === 'Slow')) {
      alertDoc = await Alert.create({
        user: site.user,
        website: site._id,
        severity: 'info',
        title: `${target} recovered`,
        description: `Service is back to normal (${responseTimeMs} ms).`,
      });
    }

    // Email the user when a Down/Slow alert is raised, if integration enabled
    if (alertDoc && (state === 'Down' || state === 'Slow')) {
      try {
        const owner = await User.findById(site.user).select('emailIntegration email');
        const recipient = owner?.emailIntegration?.connected
          ? owner.emailIntegration.email || owner.email
          : null;
        if (recipient) {
          const { html, text } = buildAlertEmail({
            severity: alertDoc.severity,
            title: alertDoc.title,
            description: alertDoc.description,
            target,
            responseTimeMs,
          });
          sendMail({
            to: recipient,
            subject: `[WebSentinal] ${alertDoc.title}`,
            html,
            text,
          }).catch(() => {});
        }
      } catch (e) {
        console.error('[monitor] email alert failed:', e.message);
      }
    }
  }

  return site;
}

async function runChecks() {
  try {
    const sites = await Website.find({});
    for (const site of sites) {
      await checkWebsite(site).catch((e) => console.error('[monitor] check failed', e.message));
    }
  } catch (err) {
    console.error('[monitor] tick error', err.message);
  }
}

let timer = null;
function startMonitor() {
  if (timer) return;
  console.log(`[monitor] starting (interval ${CHECK_INTERVAL_MS}ms)`);
  // First tick after a short delay so server can finish booting
  setTimeout(runChecks, 5_000);
  timer = setInterval(runChecks, CHECK_INTERVAL_MS);
}

function stopMonitor() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { startMonitor, stopMonitor, checkWebsite, runChecks };
