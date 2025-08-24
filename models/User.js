const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Remove duplicate index - unique: true already creates an index
// userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
