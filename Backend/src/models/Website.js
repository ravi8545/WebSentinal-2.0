const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },

    // Current status as observed in the most recent check.
    status: { type: String, enum: ['Up', 'Down', 'Slow', 'Pending'], default: 'Pending' },
    // Status observed in the previous check (used for transition detection).
    lastStatus: { type: String, enum: ['Up', 'Down', 'Slow', 'Pending'], default: 'Pending' },

    responseTimeMs: { type: Number, default: 0 },
    lastChecked: { type: Date, default: null },
    totalChecks: { type: Number, default: 0 },
    successfulChecks: { type: Number, default: 0 },

    // Smart-alert bookkeeping.
    lastAlertSentAt: { type: Date, default: null },
    // Per-site cooldown override (ms). Falls back to ALERT_COOLDOWN_MS env.
    alertCooldownMs: { type: Number, default: 5 * 60_000 },
    // Consecutive Down/Slow ticks — used by the failure-confirmation threshold.
    consecutiveFailures: { type: Number, default: 0 },

    // Legacy field kept for backwards compatibility with any prior data.
    lastAlertedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

websiteSchema.virtual('uptimePercent').get(function () {
  if (!this.totalChecks) return 100;
  return (this.successfulChecks / this.totalChecks) * 100;
});

// Convenience alias requested by the smart-alert spec.
websiteSchema.virtual('currentStatus').get(function () {
  return this.status;
});

websiteSchema.set('toJSON', { virtuals: true });
websiteSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Website', websiteSchema);
