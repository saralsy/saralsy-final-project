const express = require('express');
const path = require('path');
const hbs = require('hbs');
require('./db');
const mongoose = require('mongoose');
const session = require('express-session');
// upload images using multer
const multer  = require('multer');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE);
const {GridFsStorage} = require('multer-gridfs-storage');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
     cb(null, 'uploads')
     
  },
  filename: function(req, file, cb) {
     cb(null, new Date().toISOString() + file.originalname)
  }
}) 
// Create a storage object with a given configuration

// Set multer storage engine to the newly created object
const upload = multer({ storage });

const fs = require('fs');
require('./auth');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
 
require("dotenv").config(); 
const app = express();
app.set('view engine', 'hbs');  

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI); // saved in heroku config

const User = mongoose.model('User');
const Art = mongoose.model('Art');
const List = mongoose.model('List');
const Post = mongoose.model('Post');

const publicPath = path.join(__dirname, 'public');
app.use(express.json());
app.use(express.static(publicPath));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.urlencoded({
  extended: true
})); 
app.use(session({
  secret: 'secret for signing session id',
  resave: true,
  saveUninitialized: true,
}));

passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const logger = (req, res, next) => {
  console.log(req.method, req.path, req.query);
  next();
};

app.use(logger);

app.use((req, res, next) => {
  if(req.get('Host')) {
    next();
  } else {
    res.status(400).send('invalid request');
  }
});

app.use(express.urlencoded({extended: false}));

app.use(function(req, res, next){
	res.locals.user = req.user;
	next();
});

passport.serializeUser(function(username, done) {
	done(null, user.username);
});

passport.deserializeUser(function(username, done) {
	User.findOne({username:username}, function(err, user) {
    console.log("found");
		done(err, user);
	});
});


app.get('/', (req, res)=>{
  console.log("req.user", req.user);
  res.render('landing', {user: req.user});
  // Art.find({}, (err, arts)=>{
  //   if(err){
  //     console.log(err);
  //   }
  //   console.log('showing all the pieces', arts);
  //   res.render('landing', {arts});
  // })
});

app.get('/signup', (req, res)=>{
  res.render('signup');
})

app.post('/signup', function(req, res) {
  User.register(new User({username:req.body.username}), 
      req.body.password, function(err, user){
    if (err) {
      console.log(err);
      console.log(req.body);
      res.render('signup',{message:'Your registration information is not valid'});
    } else {
      passport.authenticate('local')(req, res, function() {
        console.log('user signed up!');
        console.log('after signup', req.user);
        res.redirect('/');
      });
    }
  });   
});


app.get('/login', (req, res) => {
  res.render('login', {user: req.user, message: req.flash('error')});
});

app.post('/login', passport.authenticate('local', 
  {failureRedirect: '/login', 
    failureFlash: true}), 
  function(req, res) {
    res.redirect('/');
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/all', async (req, res) => {
  // find all the non-private drops
  Art.find({private:{$ne: true}}, (err, arts)=>{
    console.log('showing all the pieces', arts);
    res.render('home', {arts});
  })
});

function searchDrop(obj, kw){
  return obj['title'].includes(kw) || obj['tag'].includes(kw) || obj['user'].includes(kw);
}

// finding drops with keyword
app.post('/search', (req, res)=>{
  Art.find({private:{$ne: true}}, (err, arts)=>{
    const kw = req.body.search[0];
    console.log(kw);
    const result = arts.filter(obj => searchDrop(obj, kw));
    if(!result){
      return res.render('home', {arts, message: 'no Drop found that fits in the search criteria'});
    }
    res.render('home', {arts: result});
  })
  
});

// get drops that belong to the user
app.get('/user/:username', (req, res)=>{
  console.log("finding", req.user.username);
  Art.find({user: req.user.username}, (err, arts)=>{
    res.render('userHome', {arts});
  })
});

app.get('/create', (req, res)=>{
  if(!req.user){
    return res.render('login', {user: req.user, message: 'Please login to create Drop!'});
  }
  res.render('create');
});

// upload image to the gallery
app.post('/add', upload.single('image'), (req, res, next)=>{
  console.log('adding', req.body);
  // alert they have to sign in to create
 console.log('req.file', req.file);
  const newArt = new Art({
    // user: req.user.username,
    title: req.body.name,
    tag: req.body.tag,
    createdAt: new Date(),
    price: req.body.price,
    img: req.file.path,
    user: req.user.username,
    private: req.body.private,
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

app.post("/charge", (req, res) => {
  try {
    console.log("/charge", req.body);
    stripe.customers
      .create({
        name: req.body.name,
        email: req.body.email,
        source: req.body.stripeToken
      })
      .then(customer =>
        stripe.charges.create({
          amount: req.body.amount * 100,
          currency: "usd",
          customer: customer.id,
        })
      )
      .then(() => res.render('completed'))
      .catch(err => console.log(err));
  } catch (err) {
    res.send(err);
  }
});

app.listen(process.env.PORT || 3000);

