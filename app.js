const express = require('express');
const morgan = require('morgan');
const app = express();
const tourRouter = require('./routes/toursRoutes');
const userRouter = require('./routes/usersRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const Review = require('./models/reviewModel');

// 1) Middlewares
console.log(process.env.ENV);
if (process.env.ENV !== 'development') {
  app.use(morgan('dev'));
}

//adds body property to req object so we have access to the sent data
app.use(express.json());

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toString();

  next();
});

// 2) Routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.use('*', (req, res, next) => {
  next(new AppError(`can not find ${req.originalUrl} on server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
