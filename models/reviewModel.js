const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review should contain some text'],
    },
    rating: {
      type: Number,
      required: [true, 'rating should be specified'],
      min: [1, 'the rating must be above or equal to 1'],
      max: [5, 'the rating must be below or equal 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.Types.ObjectID, // maybe mongoose.Schema.ObjectId
      ref: 'Tour',
      required: [true, 'review should belong to a certain tour'],
    },

    user: {
      type: mongoose.Schema.Types.ObjectID,
      ref: 'User',
      required: [true, 'review should belong to a certain user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function (tourID) {
  const stats = await this.aggregate([
    { $match: { tour: tourID } },
    {
      $group: {
        _id: null,
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length) {
    await Tour.findByIdAndUpdate(
      { _id: tourID },
      { ratingsQuantity: stats[0].nRatings, ratingsAverage: stats[0].avgRating }
    );
    //console.log(stats);
  } else {
    await Tour.findByIdAndUpdate(
      { _id: tourID },
      { ratingsQuantity: 0, ratingsAverage: 4.5 }
    );
    console.log(stats);
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour); // review model is not created yet so that's why im using this.constructor to attach a method to model
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  this.review.constructor.calcAverageRatings(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
