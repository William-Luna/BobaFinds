const Shop = require('../models/shop');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


module.exports.index = async (req, res) => {
    const shops = await Shop.find({}).populate({
        path: 'popupText',
        strictPopulate: false
    });
    res.render('shops/index', { shops })
}

module.exports.renderNewForm = (req, res) => {
    res.render('shops/new');
}

module.exports.createShop = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.shop.location,
        limit: 1
    }).send()
    const shop = new Shop(req.body.shop);
    shop.geometry = geoData.body.features[0].geometry;
    shop.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    shop.author = req.user._id;
    await shop.save();
    console.log(shop);
    req.flash('success', 'Successfully made a new shop!');
    res.redirect(`/shops/${shop._id}`)
}

module.exports.showShop = async (req, res,) => {
    const shop = await Shop.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!shop) {
        req.flash('error', 'Cannot find that shop!');
        return res.redirect('/shops');
    }
    res.render('shops/show', { shop });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const shop = await Shop.findById(id)
    if (!shop) {
        req.flash('error', 'Cannot find that shop!');
        return res.redirect('/shops');
    }
    res.render('shops/edit', { shop });
}

module.exports.updateShop = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const shop = await Shop.findByIdAndUpdate(id, { ...req.body.shop });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    shop.images.push(...imgs);
    await shop.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await shop.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated shop!');
    res.redirect(`/shops/${shop._id}`)
}

module.exports.deleteShop = async (req, res) => {
    const { id } = req.params;
    await Shop.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted shop')
    res.redirect('/shops');
}