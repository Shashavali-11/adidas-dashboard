function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// express needs all 4 arguments to treat this as an error handler
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    status = 400;
  }
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier';
  }
  if (status === 500) {
    console.error(err);
  }

  const body = { error: message };
  if (err.details) {
    body.details = err.details;
  }
  res.status(status).json(body);
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { notFound, errorHandler, asyncHandler };
