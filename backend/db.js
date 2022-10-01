const mongoose = require("mongoose");

const mongoURL = "mongodb://localhost:27017/iNotebook";

const connectToMongo = () => {
    mongoose.connect(mongoURL, () => {
        console.log("Connected to Mongo!");
    })
}

module.exports = connectToMongo;