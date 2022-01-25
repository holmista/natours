const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require('../controllers/authController');
const {
  getAllUsers,
  getMe,
  getUser,
} = require('../controllers/usersController');
const { deleteOne } = require('../controllers/handlerFactory');
const User = require('../models/userModel');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
// protect all routes
router.use(protect);
router.get('/users', getAllUsers);
router.patch('/updateMyPassword', updatePassword);
router.get('/me', getMe, getUser);

router.use(restrictTo('admin'));
router.route('/:id').delete(deleteOne(User));

module.exports = router;
