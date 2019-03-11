var express = require('express');
var router = express.Router();
var passport = require('./passport');
//var isUserLoggedIn = passport.isUserLoggedIn;
var passportModule = passport.passportmodule;
var currentUsersBuffered = passport.currentUsersBuffered;


// Snippets:
//via https://gist.github.com/aslamdoctor/6620085 , modified
function validateUsername(str) {
  var error = "";
  var illegalChars = /\W/; // allow letters, numbers, and underscores

  if (str == "") {
      error = "Please enter Username and Password";
  } else if ((str.length < 5) || (str.length > 15)) {
      error = "Username and Password must have 5-15 characters";
  } else if (illegalChars.test(str)) {
  error = "Please enter valid Username and Password. Use only numbers and alphabets";
  } else {
      error = "";
  }
  return error;
}
//

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
  passportModule.authenticate('local',{failureRedirect: '/login'}),
  function(req, res) {
    req.session.username = req.body.username;
    console.log("Logging in Username:");
    console.log(req.session.username);
    res.redirect('/');
});

router.post('/deleteUser', 
  passportModule.authenticate('local',{failureRedirect: '/login'}),
  function(req, res) {
    
    console.log("Deleting Username:");
    console.log(req.session.username);


    var collection = dbUsers.get('users');
    var currentUser = req.session.username;
    collection.remove({"username":{$eq: currentUser}},{},function(err,docs)
    {
      currentUsersBuffered();
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
  function(req, res,next) {
    console.log("Trying to create user:");
    console.log(req.body.username);
    var found = false;
    var userList = currentUsersBuffered();
    var validationResultUsername = validateUsername(req.body.username.toString())
    var validationResultPassword = validateUsername(req.body.password.toString())
    if(validationResultUsername != "")
    {
      console.log("Error in username validation.");
      next(new Error(validationResultUsername));
    }
    else if (validationResultPassword != "")
    {
      console.log("Error in password validation.");
      next(new Error(validationResultPassword));
    }
    for (var i = 0; i < userList.length; i++)
    {
      if(userList[i].username.toString() === req.body.username.toString()) // dirty hack...
      {
        found = true;
        console.log("Requested user already exists! ERROR!");
        next(new Error("A User with this name already exists."));
      }
    }
    if (found === false)
    { 
      console.log("OK, creating user...");
      // Check if is within requirements
      // not done for now
      passport.insertNewUser(req.body.username, req.body.password);
      
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
