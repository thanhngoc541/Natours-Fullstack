const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// const AppError = require('../utils/appError');
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getAllReviews = catchAsync(async (req, res, next) => {
  //allow nested route
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  await factory.getAll(Review, filter)(req, res, next);
  next();
});

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
