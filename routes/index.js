var express = require('express');
var router = express.Router();

var monk = require('monk');
var mongoDB_accessPath = process.env.SHELLMONEY_MONGODB_ACCESS
var dbUsers = monk(mongoDB_accessPath + '/shellmoney');

// For now we buffer the userDB as mongo-access is async and it seems like passportjs
// likes to have a decision on wether a user is valid like DIRECTLY!!11
// -.-'
var currentUsersBuffered = {};
dbUsers.get('users').find({},{},function(err,docs){
  currentUsersBuffered = docs;
});
//

///////////////////////////////
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
passport.use(new Strategy(
  function(username, password, cb) {
    var found = false;
    for (var i = 0; i < currentUsersBuffered.length; i++)
    {
      if(currentUsersBuffered[i].username === username
        && currentUsersBuffered[i].password === password)
        {
          found = true;
          return cb(null, currentUsersBuffered[i]);
        }

    }
    if (found === false)
    { 
      return cb(null, false); 
    }

}));
passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});
passport.deserializeUser(function(id, cb) {
  var found = false;
  for (var i = 0; i < currentUsersBuffered.length; i++)
  {
    if(currentUsersBuffered[i]._id.toString() === id.toString()) // dirty hack...
    {
      found = true;
      return cb(null, currentUsersBuffered[i]);
    }
  }
  if (found === false)
  { 
    return cb(null, false); 
  }
});
///////////////////////////////


/* GET home page. */
router.get('/login', function(req, res, next) {
  res.render('startup', 
  { 
    title: '🐚'/*, getThing : function() {return "lol";}*/ ,
    message: "Welcome to shellmoney!",
    fullURL: process.env.SHELLMONEY_URL
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  if (typeof req.session.username === 'undefined' || req.session.username === null)
  {
    res.redirect('/login');
  }
  else
  {
    console.log("Rendering for Username:");
    console.log(req.session.username);
    res.render('layout', 
    { 
      title: '🐚',
      fullURL: process.env.SHELLMONEY_URL,
      userID: req.session.username
    });
  }
});

router.post('/login', 
    passport.authenticate('local',{failureRedirect: '/login'}),
    function(req, res) {
      req.session.username = req.body.username;
      console.log("Logging in Username:");
      console.log(req.session.username);
      res.redirect('/');
    });


router.post('/createUser',
  function(req, res) {
    console.log("Trying to create user:");
    console.log(req.body.username);
    var found = false;
    for (var i = 0; i < currentUsersBuffered.length; i++)
    {
      if(currentUsersBuffered[i].username.toString() === req.body.username.toString()) // dirty hack...
      {
        found = true;
        console.log("Requested user already exists! ERROR!");
        res.redirect('/login');
      }
    }
    if (found === false)
    { 
      console.log("OK, creating user...");
      // Check if is within requirements
      // not done for now
      var collection = dbUsers.get('users');
      collection.insert({username: req.body.username, password: req.body.password}, function(err, result)
      {
        if (err !== null)
        {
          res.send(
            (err === null) ? { msg: '' } : { msg: err }
          );
          return;
        }
        else
        {
          // Add user to MongoDB and update local duplicate object.
          dbUsers.get('users').find({},{},function(err,docs){
            currentUsersBuffered = docs;
            console.log("DEBUG11");
            console.log(currentUsersBuffered);
          });
        }
      });
      
      req.session.username = req.body.username;
      console.log("Logging in Username:");
      console.log(req.session.username);
      res.redirect('/');
    }
});


router.get('/logout', function(req, res){
  console.log("Logging out Username:");
  console.log(req.session.username);
  console.log(req.user);
  req.logout();
  req.session.username = null;
  res.redirect('/login');
});

module.exports = router;
