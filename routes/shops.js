const express = require('express');
const router = express.Router();
const shops = require('../controllers/shops');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateShop, isAuthor } = require('../middleware');

const Shop = require('../models/shop');

router.route('/')
    .get(catchAsync(shops.index))
    .post(isLoggedIn, validateShop, catchAsync(shops.createShop));

router.get('/new', isLoggedIn, shops.renderNewForm);

router.route('/:id').get(catchAsync(shops.showShop))
    .put(isLoggedIn, isAuthor, validateShop, catchAsync(shops.updateShop))
    .delete(isLoggedIn, isAuthor, catchAsync(shops.deleteShop));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(shops.renderEditForm));



module.exports = router;