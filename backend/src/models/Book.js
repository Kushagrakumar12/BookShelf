const mongoose = require('mongoose');

const MAX_YEAR = new Date().getFullYear() + 5;

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    publishedYear: {
      type: Number,
      required: [true, 'Published year is required'],
      min: [1, 'Published year must be at least 1'],
      max: [MAX_YEAR, `Published year cannot be greater than ${MAX_YEAR}`],
    },
    genre: {
      type: String,
      trim: true,
      default: 'Uncategorized',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Book', bookSchema);
