const AppError = require('../utils/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field ${Object.keys(err.keyValue)[0]}: ${
    Object.values(err.keyValue)[0]
  }`;
  return new AppError(message, 400);
};

const handleValidationsDB = (err) => {
  const errors = Object.values(err.errors).map((elem) => elem.message);
  const message = `Invalid input data ${errors.join(', ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  return new AppError('Invalid token, log in again', 401);
};

const handleExpiredError = (err) => {
  return new AppError('The token has expired, log in again', 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statuscode).json({
      status: err.status,
      message: err.message,
    });
  }
  // unknown error
  else {
    // 1) log error
    console.error(err);
    // 2) send message
    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.ENV === 'development') {
    // if ((err.name = 'ValidationError')) {
    //   console.log('yes');
    // }
    console.log('here');
    sendErrorDev(err, res);
  } else if (process.env.ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') {
      error = handleCastError(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    //console.log(error);
    if (err.name === 'ValidationError') {
      error = handleValidationsDB(error);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }
    if (err.name === 'TokenExpiredError') {
      error = handleExpiredError(error);
    }
    sendErrorProd(error, res);
  }
};
