/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCATCHED_EXCEPTION! Shutting down... \n', err);
  process.exit(1);
});
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })

  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App on http://localhost:${port} in ${process.env.NODE_ENV} mode`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED_REJECTION! Shutting down... \n', err);
  server.close(() => {
    process.exit(1);
  });
});
process.on('SIGTERM', () => {
  console.log('SIGNTERM RECEIVED , Shutting down');
  server.close(() => {
    console.log('Process terminated');
  });
});
