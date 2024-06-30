const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor, emailVerified } = require('../middleware');
const Audiobook = require('../models/audiobook');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

router.post('/', isLoggedIn, validateReview, emailVerified ,catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, emailVerified, catchAsync(reviews.deleteReview))

module.exports = router;