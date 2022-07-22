const express = require('express');
const router = express.Router({ mergeParams: true });
const Shop = require('../models/shop');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}



router.post('/', validateReview, catchAsync(async (req, res) => {
    const shop = await Shop.findById(req.params.id);
    const review = new Review(req.body.review);
    shop.reviews.push(review);
    await review.save();
    await shop.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/shops/${shop._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Shop.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/shops/${id}`);
}))

module.exports = router;

// app.post('/shops/:id/reviews', validateReview, catchAsync(async (req, res) => {
//     const shop = await Shop.findById(req.params.id);
//     const review = new Review(req.body.review);
//     shop.reviews.push(review);
//     await review.save();
//     await shop.save();
//     res.redirect(`/shops/${shop._id}`);
// }))

// app.delete('/shops/:id/reviews/:reviewId', catchAsync(async (req, res) => {
//     const { id, reviewId } = req.params;
//     await Shop.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/shops/${id}`);
// }))