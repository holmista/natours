const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');

const getAllUsers = getAll(User);

const deleteUser = deleteOne(User);
// don't update password with this
const updateUser = updateOne(User);
const getUser = getOne(User);
const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
module.exports = { getAllUsers, deleteUser, updateUser, getMe, getUser };
