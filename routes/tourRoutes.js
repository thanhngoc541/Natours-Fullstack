const express = require('express');
const controller = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

// router.param('id', controller.checkID);
router
  .route('/monthly-plan/:year')
  .get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), controller.getMonthlyPlan);
router.route('/tour-stats').get(controller.getTourStats);
router.route('/top-5-cheap').get(controller.aliasTopTours, controller.getAllTours);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(controller.getToursWithin);
router.route('/distance/:latlng/unit/:unit').get(controller.getDistances);

router
  .route('/')
  .get(controller.getAllTours)
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), controller.createTour);

router
  .route('/:id')
  .get(controller.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    controller.uploadTourImages,
    controller.resizeTourImages,
    controller.updateTour
  )
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), controller.deleteTour);

module.exports = router;
