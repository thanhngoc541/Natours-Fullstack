const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
// const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRoutes = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();
app.enable('trust proxy');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
//GLOBAL MIDDLEWARE
//implements CORS
app.use(cors());
//app.use(cors({origin:'http://natours.com}))
app.options('*', cors());
// app.options('/api/v1/tour/tourId', cors('http://natours.com'));
//set security HTTP headers
app.use(helmet());
//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit requests from one IP
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);
//body-parser , reading data from body to req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//data sanitization against NoSQL query injection : Query with mongo operators
app.use(mongoSanitize());
//data sanitization against xss : Query with html data
app.use(xss());

app.use(compression());
//prevent parameter pollution : Query with multiple same-parameters : fixed => current no needed
// app.use(
//   hpp({
//     whitelist: ['duration', 'ratingsQuality', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'],
//   })
// );
//serving static file
// app.use(express.static(`${__dirname}/public/`));

//policy issues policy
// app.use((req, res, next) => {
//   res.set('Content-Security-Policy', 'connect-src *');
//   console.log(req);
//   next();
// });

//ROUTES

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/', viewRoutes);

app.all('/*', (req, res, next) => {
  next(new AppError(`Can't find ${req.path} on this server`, 404));
});
//catch global error
app.use(globalErrorHandler);
module.exports = app;
