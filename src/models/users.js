const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  isAdmin: {
    type: String,
    required: true
  },
  keys: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Key' }
  ],
  isDeleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('User', userSchema);