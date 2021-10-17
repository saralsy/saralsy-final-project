// 1st Draft Data Model
const mongoose = require('mongoose');

// users
// authentication plugin provides username and password hash
const User = new mongoose.Schema({
    lists: [{type: mongoose.mongoose.Schema.Types.ObjectId, ref:'Art'}],
    wallet: {type: String, required: true},
    artSold: {type: Number, default: 0, required: true}
})

// art pieces
const Art = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    title: {type: String, required: true},
    createdAt: {type: Date, required: true},
    category: [{type: mongoose.Schema.Types.ObjectId, ref:'List'}],
    price: {type: Number, min: 0, required: true},
    public: {type: Boolean, default: false, required: true},
    sold: {type: Boolean, default: false, required: true},
})

// list of art items displayed if they are public
const List = new mongoose.Schema({
    name: {type: String, required: true},
    items: [{type: mongoose.mongoose.Schema.Types.ObjectId, ref:'Art'}],
})