const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override'); //require method-override middleware

//Configs
require('dotenv').config();
require('./config/database'); // connect to the database with AFTER the config vars are processed
require('./config/passport');

//Routers
const indexRouter = require('./routes/index');
const moviesRouter = require('./routes/movies');
const reviewsRouter = require('./routes/reviews');
const performersRouter = require('./routes/performers');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(methodOverride('_method')); //mount methodOverride

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) { //when user is logged in, add a user variable that’s available inside all EJS templates; using Express’ res.locals object. If nobody is logged in, user will be undefined.
  res.locals.user = req.user;
  next();
});


app.use('/', indexRouter);
app.use('/movies', moviesRouter);
// Mount these routers to root because not all 
// paths for a related/nested resource begin the same
app.use('/', reviewsRouter);
app.use('/', performersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
