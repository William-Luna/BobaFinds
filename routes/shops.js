const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateShop, isAuthor } = require('../middleware');

const Shop = require('../models/shop');

router.get('/', catchAsync(async (req, res) => {
    const shops = await Shop.find({});
    res.render('shops/index', { shops })
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('shops/new');
})


router.post('/', isLoggedIn, validateShop, catchAsync(async (req, res, next) => {
    const shop = new Shop(req.body.shop);
    shop.author = req.user._id;
    await shop.save();
    req.flash('success', 'Successfully made a new shop!');
    res.redirect(`/shops/${shop._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const shop = await Shop.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(shop);
    if (!shop) {
        req.flash('error', 'Cannot find that shop!');
        return res.redirect('/shops');
    }
    res.render('shops/show', { shop });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const shop = await Shop.findById(id)
    if (!shop) {
        req.flash('error', 'Cannot find that shop!');
        return res.redirect('/shops');
    }
    res.render('shops/edit', { shop });
}))

router.put('/:id', isLoggedIn, isAuthor, validateShop, catchAsync(async (req, res) => {
    const { id } = req.params;
    const shop = await Shop.findByIdAndUpdate(id, { ...req.body.shop });
    req.flash('success', 'Successfully updated shop!');
    res.redirect(`/shops/${shop._id}`)
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Shop.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted shop')
    res.redirect('/shops');
}));

module.exports = router;