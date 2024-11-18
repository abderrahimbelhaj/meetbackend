const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nom: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['utilisateur','admin'], required: true },
});

module.exports = mongoose.model('User', UserSchema);
