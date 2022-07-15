const mongoose = require('mongoose');
const cities = require('./cities');
const { nouns, descriptors } = require('./seedHelpers');
const Shop = require('../models/shop');

connect().catch(err => {
    console.log("MONGO CONNECTION FAILED");
    console.log(err);
});

async function connect() {
    await mongoose.connect('mongodb://localhost:27017/bobaShops');
    console.log("DATABASE CONNECTED");
};

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Shop.deleteMany({});

    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const shop = new Shop({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(nouns)}`
        });
        await shop.save();
    }
    console.log("SEEDING FINISHED");
}
seedDB().then(() => {
    mongoose.connection.close();
    console.log("DATABASE CLOSED");
})