const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)[0];
  const field = Object.keys(err.keyPattern)[0];
  const message = `Duplicate field ${field}: ${value}, Please use another value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => new AppError(err.message, 400);
const handleJWTError = () => new AppError('Invalid token', 401);
const handltJWTExpiredError = () => new AppError('Token expired', 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }
  // eslint-disable-next-line no-console
  console.error('ERROR: ', err);
  res.status(err.statusCode).render('error', {
    title: 'Some thing went wrong',
    msg: err.message,
  });
};
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //Programing error or other unknown errors
    // eslint-disable-next-line no-console
    console.error('ERROR: ', err);
    return res.status(500).json({ status: 'error', message: 'Something went wrong' });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Some thing went wrong',
      msg: err.message,
    });
  }
  //Programing error or other unknown errors
  // eslint-disable-next-line no-console
  console.error('ERROR: ', err);
  return res.status(err.statusCode).render('error', {
    title: 'Some thing went wrong',
    msg: 'Please try again later',
  });

  //Operational, trusted error: send to client
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') sendErrorDev(err, req, res);
  else {
    if (err.isOperational) return sendErrorProd(err, req, res);
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(err);
    if (err.name === 'TokenExpiredError') error = handltJWTExpiredError(err);
    sendErrorProd(error, req, res);
  }
};
