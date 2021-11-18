const express = require('express');
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose');
const session = require('express-session');
require('./db');
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

app.use(function(req, res, next){
	res.locals.user = req.user;
	next();
});
// this gives us access to req.body
// req.body contains the parsed http request
// body (assuming it's in urlencoded format:
// name=val&name2=val2

passport.serializeUser(function(username, done) {
	done(null, user.username);
});

passport.deserializeUser(function(username, done) {
	User.findOne({username:username}, function(err, user) {
    console.log("found");
		done(err, user);
	});
});


// passport.use(
//   new LocalStrategy({usernameField: "username"}, (username, password, done)=>{
//     User.findOne({username: username})
//         .then(user => 
          
//           bcrypt.compare(password, user.password), (err, isMatch)=>{
//             console.log("found");
//           if(err) throw err;
//           if(isMatch){
//             console.log('found user');
//             return done(null, user);
//           } else {
//             console.log('didnt find');
//             return done(null, false, {message: 'invalid username or password'} )
//           }
//         })
//         .catch(err => {
//           return done(null, false, {message: err});
//         })
//   })
// )

// make user data available to all templates, adding properties to res.locals


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

// app.post('/login', function(req,res,next) {
//   passport.authenticate('local', function(err,user) {
//     console.log('login user', user);
//     if(user) {
//       req.logIn(user, function(err) {
//         res.redirect('/');
//       });
//     } else {
//       console.log(err);
//       res.render('login', {message:'Your login or password is incorrect.'});
//     }
//   })(req, res, next);
// });

app.get('/all', async (req, res) => {
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

