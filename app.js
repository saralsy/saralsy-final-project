const express = require('express');
const path = require('path');
const db = require('./db');
const hbs = require('hbs');
const mongoose = require('mongoose');
const session = require('express-session');
require("dotenv").config(); 
const bodyParser = require('body-parser');
const app = express();
app.set('view engine', 'hbs');

const publicPath = path.join(__dirname, 'public');
app.use(express.json());
app.use(express.static(publicPath));
app.use(express.urlencoded({
  extended: true
})); 
app.use(session({
  secret: 'secret for signing session id',
  resave: false,
  saveUninitialized: true,
}));

const logger = (req, res, next) => {
  console.log(req.method, req.path, req.query);
  next();
};

app.use(logger);

// middleware that checks the Host: header of an http request
// if it exists OK!... go on to next middleware or route
// if it doesn't exist, send back a 400
app.use((req, res, next) => {
  if(req.get('Host')) {
    next();
  } else {
    res.status(400).send('invalid request');
  }
});

app.use(express.urlencoded({extended: false}));
// this gives us access to req.body
// req.body contains the parsed http request
// body (assuming it's in urlencoded format:
// name=val&name2=val2

hbs.handlebars.registerHelper('if_even', function(conditional, options) {
  if((conditional % 2) == 0) {
    return options.fn(this);
  } 
});

hbs.handlebars.registerHelper('if_odd', function(conditional, options) {
  if((conditional % 2) != 0) {
    return options.fn(this);
  } 
});

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI); // saved in heroku config

const User = mongoose.model('User');
const Art = mongoose.model('Art');
const List = mongoose.model('List');
const Post = mongoose.model('Post');

// route handler
// it responds to a an http request based on method (GET) and path (/)
// ... use get to add rourtes, first argument is path
// second arg is callback... that will get called when a request to GET /
// comes in ...it will be invoked with a request and response object
// an instance of Request: path, method, query, params, body *, get (for headers)
// an instance of Response: status(), send(), sendFile(), ... render()
// one of the methods above must be called to end the req/res cycle ^^^
app.get('/all', (req, res) => {
  Art.find({}, (err, arts)=>{
    console.log('showing all the pieces', arts);
    res.render('home', {arts});
  })
});

app.get('/create', (req, res)=>{
  res.render('create');
});

app.post('/add', (req, res)=>{
  console.log('adding', req.body);
  const newArt = new Art({
    title: req.body.name,
    category: req.body.tag,
    // fileId: req.body.fileId
  })
  newArt.save((err, post)=>{
    console.log("after form", req.body);
    console.log('saved', post);
    res.redirect('/all');
  })
});

app.get('/delete', (req, res)=>{
  console.log("deleting", req.query.title);
  Art.deleteOne({"title": req.query.title}, function(err){
    if(err){
      console.log(err);
    }
    console.log("deleted", req.query.title);
  });
  res.redirect('/all');
});


app.get('/post', (req, res)=>{
  Post.find({}, (err, posts)=>{
    console.log(posts);
    res.render('addPost', {posts});
  })
})

app.post('/post', (req, res)=>{
  const newPost = new Post({
    title: req.body.title,
    content: req.body.content
  })
  newPost.save((err, post)=>{
    console.log('saved', post);
    res.redirect('/');
  })
})


app.post('/', (req, res)=>{
  const newFile = new Art({
    title: req.body.title
  });
  newFile.save((err, result)=>{
    console.log("art saved", result);
  })
  res.send('<h1>received</h1>');
})

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/action', (req, res) => {
  console.log('got this body', req.body);
  res.redirect('/form');
});

app.get('/product', (req, res) => {
  const num1 = parseInt(req.query.num1);
  const num2 = parseInt(req.query.num2);
  const product = num1 * num2;
  console.log(product);
  res.render('calculate', {result: product});
  // res.status(200).send(isNaN(product) ? 'not a number' : '' + product);
});



app.get("/api/movie", function (req, res) {
  MongoClient.connect(uri, function(err, client){
    if(err) throw err
    const db = client.db('sample_mfix').findOne().toArray(function (err, result){
      if(err) throw err
      console.log(result);
    })
  })
});

app.get('/pb', (req, res) => {

  const shows = [
    {name: 'at', year:2012},
    {name: 'gravity falls'}
  ];

  const kingdoms = {
    'candy': 'pb', 
    'ice': 'ice king', 
  };
  const context = {
    character1: 'princess bubblegum!!!!!!!',
    character2: 'peppermint butler',
    favs: ['pb', 'pepbut', 'magic man'],
    places: kingdoms,
    shows: shows
  };
  res.render('pb', context);
});



app.listen(process.env.PORT || 3000);

