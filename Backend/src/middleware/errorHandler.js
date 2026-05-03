// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, _next) {
  console.error('[Error]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Server error',
  });
};
