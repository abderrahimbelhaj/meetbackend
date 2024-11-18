const mongoose = require('mongoose');

const transcriptionSchema = new mongoose.Schema({
 
  audioPath: {
    type: String,
    required: true
  },
  transcript: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Transcription = mongoose.model('Transcription', transcriptionSchema);

module.exports = Transcription;
