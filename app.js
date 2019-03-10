console.log("Starting Shellmoney...");
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

var session = require('express-session');
const uuidv4 = require('uuid/v4');

// Database
var monk = require('monk');
var MongoDBStore = require('connect-mongodb-session')(session);

// Parse CMD line argument to get MongoDB Path:
var mongoDB_accessPath = process.env.SHELLMONEY_MONGODB_ACCESS
//console.log(mongoDB_accessPath)

var dbTransactions = monk(mongoDB_accessPath + '/shellmoney');
var dbCategories = monk(mongoDB_accessPath + '/shellmoney');
var dbAccounts = monk(mongoDB_accessPath + '/shellmoney');
var dbUsers = monk(mongoDB_accessPath + '/shellmoney');
var dbSessions = monk(mongoDB_accessPath + '/shellmoney');
// Clear all sessions on startup
dbSessions.get('sessions').remove({});


var passport = require('passport');
var ppStrategy = require('passport-local').Strategy;
passport.use(new ppStrategy(
  function(username, password, cb) {
    var collection = dbUsers.get('users');
    collection.find({ username: { $eq: username } },{},function(err,docs){
      if (err) { return cb(err); }
      if (docs.length !== 1) { return cb(null, false); }
      if (docs[0].password != password) { return cb(null, false); }
      return cb(null, user);
    });
}));
passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});

passport.deserializeUser(function(id, cb) {
  var collection = dbUsers.get('users');
  collection.find({ _id: { $eq: id } },{},function(err,docs){
    if (err) { return cb(err); }
    if (docs.length !== 1) { return cb(new Error("More than one matching user found")); }
    return cb(null, docs[0]);
  });

});





var app = express();
var indexRouter = require('./routes/index');
var dbRouter = require('./routes/db');
var storeSessions = new MongoDBStore({
  uri: 'mongodb://' + mongoDB_accessPath + '/shellmoney',
  collection: 'sessions'
});
storeSessions.on('error', function(error) {
  // Also get an error here
  console.log("Error in MongoDB access by session middleware");
  console.log(error);
});
 
app.use(session({
  'cookie': { path: '/', httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 * 2 /*two weeks */},
  'secret': uuidv4(),
  'saveUninitialized' : false,
  'store': storeSessions,
  'resave': true // this might cause issues down the road, for now nvm.
}))


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

// Fix to upload existing JSON-DB, which may be too big for node.js default settings
app.use(express.json({"limit":"16mb", extended: true}));
app.use(express.urlencoded({"limit":"16mb", extended: true }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Make our db accessible to our router
app.use(function(req,res,next){
  req.dbTransactions = dbTransactions;
  req.dbCategories = dbCategories;
  req.dbAccounts = dbAccounts;
  req.shellmoneyURL = process.env.SHELLMONEY_URL;
  req.passport = passport;
  next();
});

//Placement is important for this!
app.use('/', indexRouter);
app.use('/db', dbRouter);


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
