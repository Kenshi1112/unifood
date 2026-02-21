// ไฟล์: models/chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // หรือ User (เช็คชื่อ Model ของคุณให้ตรง)
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);