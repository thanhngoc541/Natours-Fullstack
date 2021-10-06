const express = require('express');
const controller = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();
router.get('/me', authController.protect, controller.getAccount);

router.post('/submit-user-data', authController.protect, controller.updateUserData);

router.use(authController.isLoggedIn);
router.get('/my-tours', authController.protect, controller.getMyTours);
router.get('/', bookingController.createBookingCheckout, controller.getOverview);
router.get('/tour/:slug', controller.getTour);
router.get('/login', controller.getLoginForm);
router.get('/sign-up', controller.getSignUpForm);

module.exports = router;
