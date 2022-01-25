const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user should have a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'A user should have an email'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: isEmail,
      message: 'Invalid email address',
    },
  },
  photo: String,
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user should have a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    // required means required input, we can set required fields to undefined or null later in the DB
    required: [true, 'A user should have a password confirmation'],
    validate: {
      // this only works on save or create
      validator: function (val) {
        return this.password === val;
      },
      message: 'Passwords should match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    //console.log(changedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp; // false - not changed
  }
  return false;
};

userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
