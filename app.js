var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Database
var mongo = require('mongodb');
var monk = require('monk');


// Parse CMD line argument to get MongoDB Path:
var mongoDB_accessPath = process.env.SHELLMONEY_MONGODB_ACCESS
console.log(mongoDB_accessPath)

var dbTransactions = monk(mongoDB_accessPath + '/shellmoney');
var dbCategories = monk(mongoDB_accessPath + '/shellmoney');
var dbAccounts = monk(mongoDB_accessPath + '/shellmoney');

var indexRouter = require('./routes/index');
var dbRouter = require('./routes/db');
//var userRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

// Fix to upload existing JSON-DB, which may be too big for node.js default settings
app.use(express.json({"limit":"16mb", extended: true}));
app.use(express.urlencoded({"limit":"16mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
  req.dbTransactions = dbTransactions;
  req.dbCategories = dbCategories;
  req.dbAccounts = dbAccounts;
  req.shellmoneyURL = process.env.SHELLMONEY_URL;
  next();
});
app.use('/', indexRouter);
app.use('/db', dbRouter);
//app.use('/user', userRouter); 



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
