var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/login', function(req, res, next) {
  res.render('startup', 
  { 
    title: '🐚'/*, getThing : function() {return "lol";}*/ ,
    message: "startup!",
    fullURL: process.env.SHELLMONEY_URL
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  //console.log(req);
  //console.log(req.params);
  //via https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
  //var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log("Rendering for Username:");
  console.log(req.session.username);

  if (typeof req.session.username === 'undefined') {
    res.redirect('/login');
  }
  else
  {
    res.render('layout', 
    { 
      title: '🐚',
      fullURL: process.env.SHELLMONEY_URL,
      userID: req.session.username
    });
  }
});

router.post('/login',
  function(req, res) {
    req.passport.authenticate('local', { failureRedirect: '/login'});
    req.session.username = req.body.username;
    console.log("Logging in Username:");
    console.log(req.session.username);
    res.redirect('/');
});

router.get('/logout', function(req, res){
  console.log("Logging out Username:");
  console.log(req.session.username);
  console.log(req.user);
  req.logout();
  res.redirect('/');
  console.log(req.session.username);
  console.log(req.user);
});

module.exports = router;
