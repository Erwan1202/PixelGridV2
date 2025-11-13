const mongoose = require('mongoose');

// PixelLog Model for managing pixel logs in MongoDB
const PixelLogSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  user_id: {
    type: String, 
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const PixelLog = mongoose.model('PixelLog', PixelLogSchema);
module.exports = PixelLog;