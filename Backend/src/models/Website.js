const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Up', 'Down', 'Slow', 'Pending'], default: 'Pending' },
    responseTimeMs: { type: Number, default: 0 },
    lastChecked: { type: Date, default: null },
    totalChecks: { type: Number, default: 0 },
    successfulChecks: { type: Number, default: 0 },
  },
  { timestamps: true },
);

websiteSchema.virtual('uptimePercent').get(function () {
  if (!this.totalChecks) return 100;
  return (this.successfulChecks / this.totalChecks) * 100;
});

websiteSchema.set('toJSON', { virtuals: true });
websiteSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Website', websiteSchema);
