const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  copiesAvailable: { type: Number, required: true },
  publishedYear: { type: Number, required: false } // Make it optional

});

module.exports = mongoose.model('Book', bookSchema);
