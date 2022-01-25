const mongoose = require('mongoose');
const slugify = require('slugify');
const { isAlpha } = require('validator');
// const User = require('./userModel');

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // required is validator
      unique: true,
      trim: true,
      validate: [
        (val) => {
          return isAlpha(val, 'en-US', { ignore: ' ' });
        },
        'the name of the tour should be alphanumeric English',
      ],
      // 2 validators below only available on strings
      maxlength: [40, 'the name should not have more than 40 characters'],
      minlength: [10, 'the name should not have less than 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      //  validator available only on strings
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'tour difficulty type not supported',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      //  validators
      min: [1, 'the rating must be above or equal to 1'],
      max: [5, 'the rating must be below or equal 5'],
      set: (val) => val.toFixed(2),
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      // validate can be an array or an object
      validate: {
        validator: function (val) {
          // this validator only work when creating a new document
          return this.price > val;
        },
        message:
          'discount price {VALUE} can not be equal or greater than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'User',
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// toursSchema.index({ price: 1 });
toursSchema.index({ price: 1, ratingsAverage: -1 });
toursSchema.index({ slug: 1 });
toursSchema.index({ startLocation: '2dsphere' });
toursSchema.virtual('durationWeeks').get(function () {
  return (this.duration / 7).toFixed(2);
});

// virtual populate
toursSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Document middleware: points to doc runs only before .save() and .create()
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  console.log(this.slug);
  next();
});

// // Document middleware: runs after all pre middleware functions have executed
// toursSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// Query middleware: point to query
toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});

toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});

// Aggregation middleware
toursSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', toursSchema);
module.exports = Tour;
