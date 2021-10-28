const express = require('express');
const path = require('path');

const app = express();
app.set('view engine', 'hbs');

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

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


// route handler
// it responds to a an http request based on method (GET) and path (/)
// ... use get to add rourtes, first argument is path
// second arg is callback... that will get called when a request to GET /
// comes in ...it will be invoked with a request and response object
// an instance of Request: path, method, query, params, body *, get (for headers)
// an instance of Response: status(), send(), sendFile(), ... render()
// one of the methods above must be called to end the req/res cycle ^^^
app.get('/', (req, res) => {
  res.send('<h1>my fav adventure time character</h1>');
});

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




app.listen(3000);
