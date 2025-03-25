const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  keyId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isVerify: {
    type: Boolean,
    required: true
  },
  scanLocation: {
    type: String
  }, // Optional: GPS/Device info
  errorMessage: {
    type: String
  } // If isVerify=false, store reason
});

module.exports = mongoose.model('Log', logSchema);