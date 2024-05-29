const mongoose = require('mongoose');
const Audiobook = require('../models/audiobook');  // Adjust the path as needed
const User = require('../models/user');  // Assuming you have a User model
const { genres, titles } = require('./seedHelpers');
const dbUrl = process.env.DB_URL || 'mongodb://0.0.0.0:27017/audiobook-app'

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Audiobook.deleteMany({});
    const user = await User.findOne();  // Assuming you have at least one user in your User collection

    for (let i = 0; i < 10; i++) {
        const price = Math.floor(Math.random() * 20) + 10;
        const audiobook = new Audiobook({
            title: `${sample(titles)} ${sample(genres)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            author: '5f5c330c2cd79d538f2c66d9',  // Use an existing user ID
            genre: 'Fiction',  // Example genre, adjust as needed
            images: [
                {
                    url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                    filename: 'sample1'
                },
                {
                    url: 'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
                    filename: 'sample2'
                }
            ]
        });
        await audiobook.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});
