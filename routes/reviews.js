const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Shop = require('../models/shop');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');


router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const shop = await Shop.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    shop.reviews.push(review);
    await review.save();
    await shop.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/shops/${shop._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Shop.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/shops/${id}`);
}))

module.exports = router;