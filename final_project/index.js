const express = require('express');
const session = require('express-session');
const { randomBytes } = require('node:crypto');
const app = express();
app.use(express.json());
app.set('json spaces', 2);
app.use('/customer', session({
  secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
  resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));
app.use('/customer', require('./router/auth_users').authenticated);
app.use('/', require('./router/general').general);
app.listen(process.env.PORT || 5000, () => console.log('Bookstore server running'));
