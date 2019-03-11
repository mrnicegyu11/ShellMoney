var express = require('express');
var router = express.Router();
var passport = require('./passport').passport;
var isUserLoggedIn = require('./passport').isUserLoggedIn;

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

router.post('/deleteUser', 
  passport.authenticate('local',{failureRedirect: '/login'}),
  function(req, res) {
    
    console.log("Deleting Username:");
    console.log(req.session.username);


    var collection = dbUsers.get('users');
    var currentUser = req.session.username;
    collection.remove({"username":{$eq: currentUser}},{},function(err,docs)
    {
      currentUsersBuffered = docs;
    });

    var username = currentUser;
    var db = req.dbAccounts;
    var collection = db.get('accounts');
    collection.remove({ 'userID' : username });
    db = req.dbCategories;
    collection = db.get('categories');
    collection.remove({ 'userID' : username });
    db = req.dbTransactions;
    collection = db.get('transactions');
    collection.remove({ 'userID' : username });
  
    console.log("DELETED all data of user: " + username);

    req.session.username = null;
    res.redirect('/login');
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
