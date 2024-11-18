const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  sujetReunion: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  heure: {
    type: String,
    required: true,
   
  },
  nombreParticipants: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Meeting = mongoose.model('Meeting', MeetingSchema);
module.exports = Meeting;
