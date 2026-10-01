const express = require('express');
const { scryptSync, randomBytes, timingSafeEqual } = require('node:crypto');
const books = require('./booksdb');
const authenticated = express.Router();
const users = new Map();
const isValid = username => typeof username === 'string' && username.trim().length > 0;
function register(username, password) {
  const salt = randomBytes(16).toString('hex');
  users.set(username, { salt, hash: scryptSync(password, salt, 64) });
}
function authenticatedUser(username, password) {
  const user = users.get(username);
  return !!user && typeof password === 'string' && timingSafeEqual(user.hash, scryptSync(password, user.salt, 64));
}
authenticated.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!authenticatedUser(username, password)) return res.status(401).json({ message: 'Invalid username or password' });
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ message: 'Login failed' });
    req.session.username = username;
    res.json({ message: 'Successfully logged in', username });
  });
});
authenticated.use('/auth', (req, res, next) => {
  if (!req.session.username) return res.status(401).json({ message: 'Please log in first' });
  next();
});
authenticated.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const review = req.body.review || req.query.review;
  if (typeof review !== 'string' || !review.trim()) return res.status(400).json({ message: 'Review is required' });
  Object.defineProperty(book.reviews, req.session.username, { value: review, enumerable: true, writable: true, configurable: true });
  res.json({ message: 'Review added or updated successfully', reviews: book.reviews });
});
authenticated.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  delete book.reviews[req.session.username];
  res.json({ message: 'Review deleted successfully', reviews: book.reviews });
});
module.exports = { authenticated, users, isValid, register, authenticatedUser };
