const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    website: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
    target: { type: String, required: true },
    statusCode: { type: Number, default: 0 },
    responseTimeMs: { type: Number, default: 0 },
    message: { type: String, default: '' },
    state: { type: String, enum: ['Up', 'Down', 'Slow'], default: 'Up' },
  },
  { timestamps: true },
);

logSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);
