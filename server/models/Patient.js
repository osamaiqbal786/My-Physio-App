const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
patientSchema.index({ userId: 1 });
patientSchema.index({ name: 1 });

module.exports = mongoose.model('Patient', patientSchema);
