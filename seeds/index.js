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

    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 9) + 1;
        const shop = new Shop({
            author: '62db870f07c1ae5574c6fb40', //ObjectId('62db870f07c1ae5574c6fb40')
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(nouns)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse rem nobis, recusandae voluptatem beatae cumque tempore illum accusantium odit velit ea ipsa asperiores, officiis adipisci corporis? Itaque sed facere voluptate?',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dxemsk6ez/image/upload/v1659561573/BobaFinds/pwdxnuxzug94a5nral3w.jpg',
                    filename: 'BobaFinds/pwdxnuxzug94a5nral3w',
                }
            ]
        });
        await shop.save();
    }
    console.log("SEEDING FINISHED");
}
seedDB().then(() => {
    mongoose.connection.close();
    console.log("DATABASE CLOSED");
})