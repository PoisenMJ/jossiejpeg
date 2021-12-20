var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var sass = require('node-sass-middleware');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var cors = require('cors');
var process = require('process');

require('./models/index');
var User = require('./models/user');

var indexRouter = require('./routes/index');
var paymentRouter = require('./routes/payment');
var adminRouter = require('./routes/admin');

var app = express();
cors(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(sass({
  src: __dirname + '/sass',
  dest: __dirname + '/public',
  // debug: true
}));

app.use(logger('dev'));
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist/static/js')));
app.use(session({
  saveUninitialized: true,
  resave: false,
  secret: process.env.SESSION_SECRET
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use('local', new LocalStrategy({
  usernameField: 'email'
}, (email, password, done) => {
  User.findOne({ email: email }, (err, user) => {
    console.log(user);
    if(err) return done(err, false);
    if(!user) return done(null, false);
    if(!user.checkPassword(password)) return done(null, false);
    if(user.role == "banned") return done(null, false);
    return done(null, user);
  })
}));

// PASSPORT SERIALIZE AND DESERIALIZE RES.USER OBJECT
passport.serializeUser(function(user, done) {
  done(null, user.username);
});
passport.deserializeUser(function(user, done) {
  User.findOne({ username: user }, (err, user) => {
    done(err, user);
  })
})

// NORMAL ROUTES
app.use('/', indexRouter);
app.use('/payment', paymentRouter);
app.use('/admin', adminRouter);

// STATIC ROUTES
app.use('/content', express.static(path.join(process.cwd(), 'content')));
app.use('/bootstrap', express.static(path.join(process.cwd(), "node_modules/bootstrap/dist")));

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
