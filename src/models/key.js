const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
  keyId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPermanent: {
    type: Boolean,
    default: false
  },
  startDate: Date,
  endDate: Date,
  allowedHours: [Number],
  isRevoked: {
    type: Boolean,
    default: false
  },
  googleWalletLink: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Key', keySchema);