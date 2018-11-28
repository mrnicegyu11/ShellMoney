var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('layout', 
  { 
    title: '🐚'/*, getThing : function() {return "lol";}*/ ,
    userID: none
  });
});

/* GET home page. */
router.get('/:userID/', function(req, res, next) {
  //console.log(req);
  //console.log(req.params);
  res.render('layout', 
  { 
    title: '🐚',
    //userID: req.params.userID
    userID: req.params.userID
    /*, getThing : function() {return "lol";}*/ 
  });
});

module.exports = router;
