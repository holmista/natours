const express = require('express');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIDs,
  getReview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');
//console.log('tour router');

const router = express.Router({ mergeParams: true });
router.use(protect);
// router.param('id', checkID);

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIDs, createReview);
router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;
