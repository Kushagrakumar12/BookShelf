const mongoose = require('mongoose');
const Book = require('../models/Book');

const isCastError = (error) =>
  error instanceof mongoose.Error.CastError || error.name === 'CastError';

// GET /api/books
const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    if (isCastError(error)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }
    res.status(500).json({ message: error.message });
  }
};

// POST /api/books
const createBook = async (req, res) => {
  try {
    const { title, author, description, publishedYear, genre } = req.body;
    const book = await Book.create({ title, author, description, publishedYear, genre });
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const { title, author, description, publishedYear, genre } = req.body;
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, description, publishedYear, genre },
      { new: true, runValidators: true }
    );
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    if (isCastError(error)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    if (isCastError(error)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook };
