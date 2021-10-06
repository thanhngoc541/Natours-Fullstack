const express = require('express');
const controller = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });
//tour/:tourId/reviews
router.use(authController.protect);
router
  .route('/')
  .get(controller.getAllReviews)
  .post(authController.restrictTo('user'), controller.setTourUserIds, controller.createReview);
router
  .route('/:id')
  .get(controller.getReview)
  .delete(authController.restrictTo('user', 'admin'), controller.deleteReview)
  .patch(authController.restrictTo('user', 'admin'), controller.updateReview);
module.exports = router;
