const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
require('dotenv').config();
const mongoURI = process.env.DB_STRING;

const connectToMongo = ()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("Connected to Mongo Successfully")
    });
}
module.exports = connectToMongo;