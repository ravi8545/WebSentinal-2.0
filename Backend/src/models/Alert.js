const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    website: { type: mongoose.Schema.Types.ObjectId, ref: 'Website' },
    severity: { type: String, enum: ['critical', 'warning', 'info'], default: 'info' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Alert', alertSchema);
