/**
 * Monitor service
 * ---------------
 * Performs HTTP probes on every registered website and writes a Log row.
 * All alerting decisions (state transitions, cooldown, severity, grouping,
 * email delivery) are delegated to AlertService.
 */

const axios = require('axios');
const Website = require('../models/Website');
const Log = require('../models/Log');
const { stripProtocol } = require('../utils/formatters');
const alertService = require('./alertService');

const CHECK_INTERVAL_MS = Number(process.env.MONITOR_INTERVAL_MS || 60_000); // 60s
const SLOW_THRESHOLD_MS = Number(process.env.MONITOR_SLOW_MS || 800);
const REQUEST_TIMEOUT_MS = Number(process.env.MONITOR_TIMEOUT_MS || 10_000);

async function probe(url) {
  const started = Date.now();
  try {
    const res = await axios.get(url, {
      timeout: REQUEST_TIMEOUT_MS,
      validateStatus: () => true,
      maxRedirects: 5,
      headers: { 'User-Agent': 'WebSentinal-Monitor/1.0' },
    });
    const responseTimeMs = Date.now() - started;
    const ok = res.status >= 200 && res.status < 400;
    if (!ok) {
      return {
        state: 'Down',
        statusCode: res.status,
        responseTimeMs,
        message: `HTTP ${res.status}`,
        isSuccess: false,
      };
    }
    if (responseTimeMs >= SLOW_THRESHOLD_MS) {
      return {
        state: 'Slow',
        statusCode: res.status,
        responseTimeMs,
        message: `OK (slow ${responseTimeMs} ms)`,
        isSuccess: true,
      };
    }
    return {
      state: 'Up',
      statusCode: res.status,
      responseTimeMs,
      message: `OK ${res.status}`,
      isSuccess: true,
    };
  } catch (err) {
    return {
      state: 'Down',
      statusCode: 0,
      responseTimeMs: Date.now() - started,
      message: err.code || err.message || 'Request failed',
      isSuccess: false,
    };
  }
}

async function checkWebsite(site) {
  const target = stripProtocol(site.url);
  const previousStatus = site.status;
  const result = await probe(site.url);

  // Update state + counters.
  site.status = result.state;
  site.responseTimeMs = result.responseTimeMs;
  site.lastChecked = new Date();
  site.totalChecks = (site.totalChecks || 0) + 1;
  if (result.isSuccess) site.successfulChecks = (site.successfulChecks || 0) + 1;

  // Log every check (audit / charts).
  await Log.create({
    user: site.user,
    website: site._id,
    target,
    statusCode: result.statusCode,
    responseTimeMs: result.responseTimeMs,
    message: result.message,
    state: result.state,
  });

  // Smart alerting — may mutate site (lastAlertSentAt, lastStatus, consecutiveFailures).
  try {
    await alertService.processCheck({
      site,
      newState: result.state,
      previousStatus,
      responseTimeMs: result.responseTimeMs,
      message: result.message,
      slowThresholdMs: SLOW_THRESHOLD_MS,
    });
  } catch (e) {
    console.error('[monitor] alertService.processCheck failed:', e.message);
  }

  // Single save per tick.
  await site.save();
  return site;
}

async function runChecks() {
  try {
    const sites = await Website.find({});
    for (const site of sites) {
      await checkWebsite(site).catch((e) =>
        console.error('[monitor] check failed', e.message),
      );
    }
  } catch (err) {
    console.error('[monitor] tick error', err.message);
  }
}

let timer = null;
function startMonitor() {
  if (timer) return;
  console.log(
    `[monitor] starting (interval ${CHECK_INTERVAL_MS}ms, slow=${SLOW_THRESHOLD_MS}ms)`,
  );
  setTimeout(runChecks, 5_000);
  timer = setInterval(runChecks, CHECK_INTERVAL_MS);
}

function stopMonitor() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = { startMonitor, stopMonitor, checkWebsite, runChecks };
