const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',');
const localhostRegex = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

function checkOrigin(origin, callback) {
  const allowed = !origin || allowedOrigins.includes(origin) || localhostRegex.test(origin);
  callback(null, allowed);
}

app.use(helmet());
app.use(cors({ origin: checkOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
