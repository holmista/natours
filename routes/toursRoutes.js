const express = require('express');
const {
  getAllTours,
  aliasTopTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getToursStats,
  busiestMonth,
  getToursWithin,
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
//console.log('tour router');
const reviewRouter = require('./reviewRoutes');
const router = express.Router();
const handlerFunction = require('../controllers/handlerFactory');
router.use('/:tourID/reviews', reviewRouter);

// router.param('id', checkID);
router.route('/busiest/:year').get(busiestMonth);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getToursStats);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// router
//   .route('/:tourID/reviews')
//   .post(protect, restrictTo('user'), createReview);

module.exports = router;
