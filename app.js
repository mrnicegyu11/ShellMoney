console.log("######################################################");
console.log("Starting Shellmoney...");
console.log("Shellmoney is runnin in the directory " + __dirname.toString() +".");
console.log("Shellmoney is running with the following options:")
console.log("SHELLMONEY_MONGODB_ACCESS: " + process.env.SHELLMONEY_MONGODB_ACCESS.toString());
console.log("SHELLMONEY_URL: " + process.env.SHELLMONEY_URL.toString());
console.log("SHELLMONEY_PORT: " + process.env.SHELLMONEY_PORT.toString());
console.log("SHELLMONEY_MODE: " + process.env.SHELLMONEY_MODE.toString());
console.log("######################################################");
console.log("");

var fs = require("fs");

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

var session = require('express-session');
const uuidv4 = require('uuid/v4');
var passport = require('passport');

// Database
var monk = require('monk');
var MongoDBStore = require('connect-mongodb-session')(session);

// Parse CMD line argument to get MongoDB Path:
var mongoDB_accessPath = process.env.SHELLMONEY_MONGODB_ACCESS

var dbTransactions = monk(mongoDB_accessPath + '/shellmoney');
var dbCategories = monk(mongoDB_accessPath + '/shellmoney');
var dbAccounts = monk(mongoDB_accessPath + '/shellmoney');
//var dbUsers = monk(mongoDB_accessPath + '/shellmoney');
var dbSessions = monk(mongoDB_accessPath + '/shellmoney');
// Clear all sessions on startup
dbSessions.get('sessions').remove({});


// Compress global.js to global.min.js
var uglify = require("uglify-js");
fs.readFile(__dirname.toString() + "/public/javascripts/global.js", "utf8", function (err, data) {
  if (err) 
  {
    console.log("An error occured:");
    console.log(err.toString());
  }
  else
  {
    //console.log(data);
    console.log("The file 'global.js' was minified with the following errors:");
    var minifiedCode = uglify.minify(data);
    if (typeof minifiedCode.error !== 'undefined')
    {
      console.log(minifiedCode.error);
    }
    else
    {
      console.log("No errors.");
    }
    fs.readFile(__dirname.toString() + "/public/javascripts/global.min.js", "utf8", function (err, data) 
    {
      if(err) 
      {
        if (err.errno.toString() === "-2")
        {
          console.log("Creating new file and writing to file...");
          fs.writeFile(__dirname.toString() + "/public/javascripts/global.min.js", minifiedCode.code, function(errn) {
            if(errn) {
                return console.log(errn);
            }
        });}
      }
      else
      {
        if(data !== minifiedCode.code.toString())
        {
          console.log("Writing to file...");
          fs.writeFile(__dirname.toString() + "/public/javascripts/global.min.js", minifiedCode.code, function(err) {
            if(err) {
                return console.log(err);
            }
          }); 
        }
        else
        {
          console.log("'global.min.js' is already up-to-date.");
        }
      }
    });
  }
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
  'cookie': { path: '/', httpOnly: true, secure: false },//, maxAge: 1000 * 60 * 60 * 24 * 7 * 2 /*two weeks */},
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
