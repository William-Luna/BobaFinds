const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { shopSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Shop = require('./models/shop');
const Review = require('./models/review');

connect().catch(err => {
    console.log("MONGO CONNECTION FAILED");
    console.log(err);
});

async function connect() {
    await mongoose.connect('mongodb://localhost:27017/bobaShops');
    console.log("MONGO CONNECTION SUCCESS");
}


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateShop = (req, res, next) => {
    const { error } = shopSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/shops', catchAsync(async (req, res) => {
    const shops = await Shop.find({});
    res.render('shops/index', { shops });
}));

app.get('/shops/new', catchAsync(async (req, res) => {
    res.render('shops/new');
}));

app.post('/shops', validateShop, catchAsync(async (req, res, next) => {

    const shop = new Shop(req.body.shop);
    await shop.save();
    res.redirect(`/shops/${shop._id}`);
}));

app.get('/shops/:id', catchAsync(async (req, res) => {
    const shop = await Shop.findById(req.params.id).populate('reviews');
    res.render('shops/show', { shop });
}));

app.get('/shops/:id/edit', catchAsync(async (req, res) => {
    const shop = await Shop.findById(req.params.id);
    res.render('shops/edit', { shop });
}));

app.put('/shops/:id', validateShop, catchAsync(async (req, res) => {
    const { id } = req.params;
    const shop = await Shop.findByIdAndUpdate(id, { ...req.body.shop });
    res.redirect(`/shops/${shop._id}`);
}));

app.post('/shops/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const shop = await Shop.findById(req.params.id);
    const review = new Review(req.body.review);
    shop.reviews.push(review);
    await review.save();
    await shop.save();
    res.redirect(`/shops/${shop._id}`);
}))

app.delete('/shops/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Shop.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/shops/${id}`);
}))

app.delete('/shops/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const shop = await Shop.findByIdAndDelete(id);
    res.redirect('/shops');
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});



app.listen(3000, () => {
    console.log('Listening on Port 3000...');
});