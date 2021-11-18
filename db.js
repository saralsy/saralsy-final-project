// 1st Draft Data Model
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const passportLocalMongoose = require('passport-local-mongoose');

require("dotenv").config(); 

// users
// authentication plugin provides username and password hash
const User = new mongoose.Schema({

    // lists: [{type: mongoose.Schema.Types.ObjectId, ref:'Art'}],
    // wallet: {type: String},
    // artSold: {type: Number, default: 0, required: true}
}, {
    writeConcern: {
       w: 'majority',
    }
});

// Passport local mongoose will add properties to the schema, as well as some static methods
User.plugin(passportLocalMongoose);

// art pieces
// TODO: add default date
const Art = new mongoose.Schema({
    title: {type: String, required: true},
    tag: {type:String}, 
    // user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    // category: [{type: mongoose.Schema.Types.ObjectId, ref:'List'}],
    // createdAt: {type: Date},
    // price: {type: Number, min: 0},
    // public: {type: Boolean, default: false, required: true},
    // sold: {type: Boolean, default: false},
    // fileId: {type: String}
})

// list of art items displayed if they are public
const List = new mongoose.Schema({
    name: {type: String, required: true},
    items: [{type: mongoose.Schema.Types.ObjectId, ref:'Art'}],
})

// test database to test the connection with mongodb
const Post = new mongoose.Schema({
    title: {type: String},
    content: {type: String}
})

console.log("saving to", process.env.MONGODB_URI);
mongoose.model('User', User);
mongoose.model('Art', Art);
mongoose.model('List', List);
mongoose.model('Post', Post);

mongoose.connect(
    process.env.MONGODB_URI, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);


module.exports = mongoose.model('User', User);