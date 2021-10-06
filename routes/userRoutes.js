const express = require('express');

const controller = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.get('/me', controller.getMe, controller.getUser);
router.patch('/updateMe', controller.uploadUserPhoto, controller.resizeUserPhoto, controller.updateMe);
router.delete('/deleteMe', controller.deleteMe);

router.use(authController.restrictTo('admin'));

router.route('/').get(controller.getAllUser).post(controller.createUser);
router.route('/:id').get(controller.getUser).patch(controller.updateUser).delete(controller.deleteUser);

module.exports = router;
