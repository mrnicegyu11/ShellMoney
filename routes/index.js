var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('error', 
  { 
    title: '🐚'/*, getThing : function() {return "lol";}*/ ,
    userID: null,
    message: "ERROR: Please select a username!",
    error: {status: "If this is the first time you are running ShellMoney, instead of www.URL.domain/shellmoney/ call www.URL.domain/shellmoney/JohnSmith_Or_Whatever."},
    fullURL: process.env.SHELLMONEY_URL
  });
});

/* GET home page. */
router.get('/:userID/', function(req, res, next) {
  //console.log(req);
  //console.log(req.params);
  //via https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
  //var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.render('layout', 
  { 
    title: '🐚',
    fullURL: process.env.SHELLMONEY_URL,
    userID: req.params.userID
    /*, getThing : function() {return "lol";}*/ 
  });
});

module.exports = router;
