const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  membershipDate: { type: Date, required: true, default: Date.now },
});

module.exports = mongoose.model('Member', memberSchema);
