import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

export const getBooks = () => API.get('/books');
export const getBook = (id) => API.get(`/books/${id}`);
export const createBook = (bookData) => API.post('/books', bookData);
export const updateBook = (id, bookData) => API.put(`/books/${id}`, bookData);
export const deleteBook = (id) => API.delete(`/books/${id}`);
