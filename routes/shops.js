const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { shopSchema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const Shop = require('../models/shop');

const validateShop = (req, res, next) => {
    const { error } = shopSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const shops = await Shop.find({});
    res.render('shops/index', { shops })
}));

router.get('/new', (req, res) => {
    res.render('shops/new');
})


router.post('/', validateShop, catchAsync(async (req, res, next) => {
    // if (!req.body.shop) throw new ExpressError('Invalid Shop Data', 400);
    const shop = new Shop(req.body.shop);
    await shop.save();
    req.flash('success', 'Successfully made a new shop!');
    res.redirect(`/shops/${shop._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const shop = await Shop.findById(req.params.id).populate('reviews');
    if (!shop) {
        req.flash('error', 'Cannot find that shop!');
        return res.redirect('/shops');
    }
    res.render('shops/show', { shop });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const shop = await Shop.findById(req.params.id)
    if (!shop) {
        req.flash('error', 'Cannot find that shop!');
        return res.redirect('/shops');
    }
    res.render('shops/edit', { shop });
}))

router.put('/:id', validateShop, catchAsync(async (req, res) => {
    const { id } = req.params;
    const shop = await Shop.findByIdAndUpdate(id, { ...req.body.shop });
    req.flash('success', 'Successfully updated shop!');
    res.redirect(`/shops/${shop._id}`)
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Shop.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted shop')
    res.redirect('/shops');
}));

module.exports = router;



// app.get('/shops', catchAsync(async (req, res) => {
//     const shops = await Shop.find({});
//     res.render('shops/index', { shops });
// }));

// app.get('/shops/new', catchAsync(async (req, res) => {
//     res.render('shops/new');
// }));

// app.post('/shops', validateShop, catchAsync(async (req, res, next) => {

//     const shop = new Shop(req.body.shop);
//     await shop.save();
//     res.redirect(`/shops/${shop._id}`);
// }));

// app.get('/shops/:id', catchAsync(async (req, res) => {
//     const shop = await Shop.findById(req.params.id).populate('reviews');
//     res.render('shops/show', { shop });
// }));

// app.get('/shops/:id/edit', catchAsync(async (req, res) => {
//     const shop = await Shop.findById(req.params.id);
//     res.render('shops/edit', { shop });
// }));

// app.put('/shops/:id', validateShop, catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const shop = await Shop.findByIdAndUpdate(id, { ...req.body.shop });
//     res.redirect(`/shops/${shop._id}`);
// }));

// app.delete('/shops/:id', catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const shop = await Shop.findByIdAndDelete(id);
//     res.redirect('/shops');
// }));