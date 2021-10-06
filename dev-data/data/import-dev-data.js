const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB connection successful!'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));

const importData = async () => {
  try {
    await Tour.create(tours);
    await Review.create(reviews);
    await User.create(users, { validateBeforeSave: false });
    console.log('Data loaded successfully');
  } catch (e) {
    console.log(e);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log('Data deleted successfully');
  } catch (e) {
    console.log(e);
  }
};
const deleteReview = async () => {
  try {
    await Review.deleteMany();

    console.log('Data deleted successfully');
  } catch (e) {
    console.log(e);
  }
};
const resetData = async () => {
  await deleteData();
  await importData();
};
// deleteData();
// importData();
if (process.argv[2] === '--import') importData();

if (process.argv[2] === '--delete') deleteData();
if (process.argv[2] === '--reset') resetData();
if (process.argv[2] === '--deleteReview') deleteReview();
// console.log(process.argv);
