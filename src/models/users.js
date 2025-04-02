const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    required: true,
    default: 'user',
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