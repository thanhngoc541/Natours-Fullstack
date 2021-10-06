const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const createSendToken = (user, statusCode, res) => {
  user.password = undefined;
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();
  createSendToken(user, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError('Please provide valid email and password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  createSendToken(user, 200, res);
});
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedOut', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ status: 'success' });
};
exports.protect = catchAsync(async (req, res, next) => {
  //get token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];
  else if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token) return next(new AppError('You need to be logged in', 401));
  //verifying
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check user
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) next(new AppError('The user belong to this token no longer exist', 401));
  //check if user changed password
  if (freshUser.changedPasswordAfter(decoded.iat)) return next(new AppError('The password has been changed', 401));
  req.user = freshUser;
  // res.locals.user = freshUser; //only server side render
  next();
});
exports.isLoggedIn = async (req, res, next) => {
  //get token
  if (req.cookies.jwt) {
    try {
      //verifying
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      // check user
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) next();
      //check if user changed password
      if (freshUser.changedPasswordAfter(decoded.iat)) return next();
      res.locals.user = freshUser;
    } catch (err) {
      return next();
    }
  }
  next();
};
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError('You do not have the permission to perform this action', 401));
    next();
  };
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('There is no user with email address', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save();
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return next(new AppError('There was an error sending email. Try again later', 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
  if (!user) return next(new AppError('Token is invalid or expired', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!user.correctPassword(req.body.passwordCurrent, user.password))
    return next(new AppError('Your current password is incorrect', 401));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});
