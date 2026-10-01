const express = require('express');
const axios = require('axios');
const books = require('./booksdb');
const { users, isValid, register } = require('./auth_users');
const general = express.Router();

general.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!isValid(username) || typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (users.has(username)) return res.status(409).json({ message: 'User already exists' });
  register(username, password);
  res.status(201).json({ message: 'User successfully registered. You can now log in.' });
});
general.get('/', (req, res) => res.json(books));
general.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});
for (const field of ['author', 'title']) {
  general.get(`/${field}/:${field}`, (req, res) => {
    const query = req.params[field].toLowerCase();
    res.json(Object.fromEntries(Object.entries(books).filter(([, book]) => book[field].toLowerCase().includes(query))));
  });
}
general.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book.reviews);
});

const baseURL = process.env.BOOKSTORE_URL || 'http://localhost:5000';
function getAllBooks() {
  return axios.get(`${baseURL}/`).then(response => response.data);
}
async function getBooksByISBN(isbn) {
  const response = await axios.get(`${baseURL}/isbn/${encodeURIComponent(isbn)}`);
  return response.data;
}
async function getBooksByAuthor(author) {
  const response = await axios.get(`${baseURL}/author/${encodeURIComponent(author)}`);
  return response.data;
}
async function getBooksByTitle(title) {
  const response = await axios.get(`${baseURL}/title/${encodeURIComponent(title)}`);
  return response.data;
}
module.exports = { general, getAllBooks, getBooksByISBN, getBooksByAuthor, getBooksByTitle };
if (require.main === module) {
  Promise.all([getAllBooks(), getBooksByISBN('1'), getBooksByAuthor('Unknown'), getBooksByTitle('Things Fall Apart')])
    .then(results => console.log(JSON.stringify(results, null, 2)))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
