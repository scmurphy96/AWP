const express = require('express');
const morgan = require('morgan');
const path = require('path');
const { User } = require('./db/User');
const app = express();
module.exports = app;

if (process.env.NODE_ENV === 'development') {
  require('../localSecrets');
}

// Logging middleware
app.use(morgan('dev'));

// You'll of course want static middleware so your browser can request things like your 'bundle.js'
app.use(express.static(path.join(__dirname, '../public')));

// Body parsing middleware
app.use(express.json());

const db = require('./db/db');
const session = require('express-session');
// configure and create our database store
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const dbStore = new SequelizeStore({ db: db });
// sync so that our session table gets created
const sync = async () => {
  try {
    await dbStore.sync();
  } catch (err) {
    console.error(err);
  }
};
sync();
// plug the store into our session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'Not a real secret',
    store: dbStore,
    resave: false,
    saveUninitialized: false,
  })
);

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

// Mounts all routes on /api
app.use('/api', require('./apiRoutes'));

// Mounts routes on /auth
app.use('/auth', require('./auth'));

// Make sure this is right at the end of your server logic!
// The only thing after this might be a piece of middleware to serve up 500 errors for server problems
// (However, if you have middleware to serve up 404s, that go would before this as well)
app.get('*', function (req, res, next) {
  res.sendFile(path.join(__dirname, '../public'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal Server Error.');
});
